import { env } from "@typebot.io/env";
import type { Readable } from "stream";
import { initClient } from "./initClient";
import { parseS3PublicBaseUrl } from "./parseS3PublicBaseUrl";

type Props = {
  key: string;
  file: Buffer | Readable;
  mimeType: string;
  visibility?: "public" | "private";
};

export const uploadFileToBucket = async ({
  key,
  file,
  mimeType,
  visibility = "public",
}: Props): Promise<string> => {
  const minioClient = initClient();

  await minioClient.putObject(env.S3_BUCKET, `${visibility}/${key}`, file, {
    "Content-Type": mimeType,
    "Cache-Control": "public, max-age=86400",
  });

  if (visibility === "public") return `${parseS3PublicBaseUrl()}/public/${key}`;
  return `${env.NEXTAUTH_URL}/api/s3/private/${key}`;
};
