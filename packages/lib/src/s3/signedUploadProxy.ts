import { createHmac, timingSafeEqual } from "node:crypto";
import { Readable, Transform } from "node:stream";
import { env } from "@typebot.io/env";
import { z } from "zod";
import { initClient } from "./initClient";
import { parseS3PublicBaseUrl } from "./parseS3PublicBaseUrl";

const uploadUrlExpiresInMs = 10 * 60 * 1000;
const cacheControl = "public, max-age=86400";

const signedUploadPayloadSchema = z.object({
  filePath: z
    .string()
    .min(1)
    .refine(
      (filePath) =>
        filePath.startsWith("public/") || filePath.startsWith("private/"),
    )
    .refine((filePath) => !filePath.split("/").includes("..")),
  fileType: z.string().min(1),
  contentDisposition: z.string().optional(),
  maxFileSize: z.number().optional(),
  expiresAt: z.number(),
});

type SignedUploadPayload = z.infer<typeof signedUploadPayloadSchema>;

type GenerateSignedUploadProxyUrlProps = {
  baseUrl: string;
  filePath: string;
  fileType: string;
  contentDisposition?: string;
  maxFileSize?: number;
};

export class SignedUploadProxyError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
  }
}

export const generateSignedUploadProxyUrl = ({
  baseUrl,
  filePath,
  fileType,
  contentDisposition,
  maxFileSize,
}: GenerateSignedUploadProxyUrlProps) => {
  const token = createSignedUploadProxyToken({
    filePath,
    fileType,
    contentDisposition,
    maxFileSize,
    expiresAt: Date.now() + uploadUrlExpiresInMs,
  });

  return {
    presignedUrl: `${baseUrl.replace(/\/$/, "")}/api/uploads/${encodeURIComponent(token)}`,
    formData: {},
    fileUrl: env.S3_PUBLIC_CUSTOM_DOMAIN
      ? `${env.S3_PUBLIC_CUSTOM_DOMAIN}/${filePath}`
      : `${parseS3PublicBaseUrl()}/${filePath}`,
    fileType,
    maxFileSize,
  };
};

export const uploadFileFromSignedUploadProxyToken = async ({
  token,
  request,
}: {
  token: string;
  request: Request;
}) => {
  const payload = verifySignedUploadProxyToken(token);
  if (Date.now() > payload.expiresAt)
    throw new SignedUploadProxyError("Upload URL has expired", 403);

  if (request.method !== "PUT")
    throw new SignedUploadProxyError("Method not allowed", 405);

  await uploadRawRequest({ request, payload });
};

const createSignedUploadProxyToken = (payload: SignedUploadPayload) => {
  const parsedPayload = signedUploadPayloadSchema.parse(payload);
  const encodedPayload = Buffer.from(JSON.stringify(parsedPayload)).toString(
    "base64url",
  );
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
};

const verifySignedUploadProxyToken = (token: string): SignedUploadPayload => {
  const tokenParts = token.split(".");
  if (tokenParts.length !== 2 || !tokenParts[0] || !tokenParts[1])
    throw new SignedUploadProxyError("Invalid upload URL", 403);

  const [encodedPayload, receivedSignature] = tokenParts;
  const expectedSignature = signPayload(encodedPayload);
  const receivedSignatureBuffer = Buffer.from(receivedSignature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    receivedSignatureBuffer.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(receivedSignatureBuffer, expectedSignatureBuffer)
  )
    throw new SignedUploadProxyError("Invalid upload URL", 403);

  try {
    const decodedPayload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    );
    const parsedPayload = signedUploadPayloadSchema.safeParse(decodedPayload);
    if (!parsedPayload.success)
      throw new SignedUploadProxyError("Invalid upload URL", 403);
    return parsedPayload.data;
  } catch (error) {
    if (error instanceof SignedUploadProxyError) throw error;
    throw new SignedUploadProxyError("Invalid upload URL", 403);
  }
};

const uploadRawRequest = async ({
  request,
  payload,
}: {
  request: Request;
  payload: SignedUploadPayload;
}) => {
  if (!request.body)
    throw new SignedUploadProxyError("Missing upload body", 400);

  const contentLength = parseContentLength(
    request.headers.get("content-length"),
  );
  const maxFileSizeInBytes = getMaxFileSizeInBytes(payload.maxFileSize);

  if (
    maxFileSizeInBytes &&
    contentLength !== undefined &&
    contentLength > maxFileSizeInBytes
  )
    throw new SignedUploadProxyError("File size limit exceeded", 413);

  const body = Readable.from(readRequestBody(request.body)).pipe(
    createMaxFileSizeStream(maxFileSizeInBytes),
  );

  await uploadObject({ payload, body, size: contentLength });
};

const uploadObject = async ({
  payload,
  body,
  size,
}: {
  payload: SignedUploadPayload;
  body: Readable;
  size?: number;
}) => {
  const minioClient = initClient();

  try {
    await minioClient.putObject(env.S3_BUCKET, payload.filePath, body, size, {
      "Content-Type": payload.fileType,
      "Cache-Control": cacheControl,
      ...(payload.contentDisposition
        ? { "Content-Disposition": payload.contentDisposition }
        : {}),
    });
  } catch (error) {
    if (error instanceof SignedUploadProxyError) throw error;
    throw new SignedUploadProxyError("Could not upload file", 500);
  }
};

const createMaxFileSizeStream = (maxFileSizeInBytes: number | undefined) => {
  let uploadedBytes = 0;

  return new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      uploadedBytes += chunk.length;

      if (maxFileSizeInBytes && uploadedBytes > maxFileSizeInBytes) {
        callback(new SignedUploadProxyError("File size limit exceeded", 413));
        return;
      }

      callback(null, chunk);
    },
  });
};

async function* readRequestBody(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();

  try {
    while (true) {
      const result = await reader.read();
      if (result.done) return;
      yield Buffer.from(result.value);
    }
  } finally {
    reader.releaseLock();
  }
}

const getMaxFileSizeInBytes = (maxFileSize: number | undefined) =>
  maxFileSize ? maxFileSize * 1024 * 1024 : undefined;

const parseContentLength = (contentLength: string | null) => {
  if (contentLength === null) return undefined;

  const parsedContentLength = Number(contentLength);

  return Number.isFinite(parsedContentLength) && parsedContentLength >= 0
    ? parsedContentLength
    : undefined;
};

const signPayload = (encodedPayload: string) =>
  createHmac("sha256", env.ENCRYPTION_SECRET)
    .update(encodedPayload)
    .digest("base64url");
