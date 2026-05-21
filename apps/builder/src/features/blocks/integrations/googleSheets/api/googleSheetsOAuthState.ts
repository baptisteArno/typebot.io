import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { ORPCError } from "@orpc/server";
import { env } from "@typebot.io/env";
import { z } from "zod";

const stateDurationMs = 10 * 60 * 1000;
const stateDurationSeconds = stateDurationMs / 1000;
export const googleSheetsOAuthStateCookieName =
  "typebot-google-sheets-oauth-state";

export const googleSheetsOAuthContextSchema = z
  .object({
    redirectUrl: z.string().optional(),
    workspaceId: z.string(),
    typebotId: z.string().optional(),
    blockId: z.string().optional(),
  })
  .refine(({ typebotId, blockId }) => Boolean(typebotId) === Boolean(blockId), {
    message: "typebotId and blockId should be provided together",
  });

const googleSheetsOAuthStatePayloadSchema = z
  .object({
    userId: z.string(),
    nonce: z.string(),
    workspaceId: z.string(),
    redirectPath: z
      .string()
      .startsWith("/")
      .refine((path) => !path.startsWith("//")),
    typebotId: z.string().optional(),
    blockId: z.string().optional(),
    expiresAt: z.number().int().positive(),
  })
  .refine(({ typebotId, blockId }) => Boolean(typebotId) === Boolean(blockId), {
    message: "typebotId and blockId should be provided together",
  });

type GoogleSheetsOAuthStatePayload = z.infer<
  typeof googleSheetsOAuthStatePayloadSchema
>;

export const createGoogleSheetsOAuthState = ({
  input,
  userId,
}: {
  input: z.infer<typeof googleSheetsOAuthContextSchema>;
  userId: string;
}) => {
  const nonce = randomBytes(32).toString("base64url");
  const encodedPayload = Buffer.from(
    JSON.stringify({
      userId,
      nonce,
      workspaceId: input.workspaceId,
      redirectPath: getSafeRedirectPath(input.redirectUrl),
      typebotId: input.typebotId,
      blockId: input.blockId,
      expiresAt: Date.now() + stateDurationMs,
    }),
  ).toString("base64url");

  return {
    state: `${encodedPayload}.${createStateSignature(encodedPayload)}`,
    cookie: createGoogleSheetsOAuthStateCookie(nonce),
  };
};

export const parseGoogleSheetsOAuthState = (
  state: string,
): GoogleSheetsOAuthStatePayload => {
  try {
    const stateParts = state.split(".");
    const encodedPayload = stateParts[0];
    const signature = stateParts[1];

    if (stateParts.length !== 2 || !encodedPayload || !signature)
      throwInvalidOAuthState();

    if (!hasValidSignature(encodedPayload, signature)) throwInvalidOAuthState();

    const payload = googleSheetsOAuthStatePayloadSchema.parse(
      JSON.parse(Buffer.from(encodedPayload, "base64url").toString()),
    );

    if (payload.expiresAt < Date.now()) throwInvalidOAuthState();

    return payload;
  } catch {
    return throwInvalidOAuthState();
  }
};

export const clearGoogleSheetsOAuthStateCookie = () =>
  createGoogleSheetsOAuthStateCookie("", 0);

const getSafeRedirectPath = (redirectUrl: string | undefined) => {
  if (!redirectUrl) return "/typebots";

  try {
    const appUrl = new URL(env.NEXTAUTH_URL);
    const url = new URL(redirectUrl, appUrl);
    if (url.origin !== appUrl.origin) return "/typebots";
    if (url.pathname.startsWith("//")) return "/typebots";
    return url.pathname;
  } catch {
    return "/typebots";
  }
};

const createStateSignature = (encodedPayload: string) =>
  createHmac("sha256", env.ENCRYPTION_SECRET)
    .update(encodedPayload)
    .digest("base64url");

const hasValidSignature = (encodedPayload: string, signature: string) => {
  const expectedSignature = Buffer.from(createStateSignature(encodedPayload));
  const candidateSignature = Buffer.from(signature);
  if (expectedSignature.byteLength !== candidateSignature.byteLength)
    return false;
  return timingSafeEqual(expectedSignature, candidateSignature);
};

const createGoogleSheetsOAuthStateCookie = (
  value: string,
  maxAge = stateDurationSeconds,
) =>
  [
    `${googleSheetsOAuthStateCookieName}=${value}`,
    `Max-Age=${maxAge}`,
    "Path=/api/credentials/google-sheets/callback",
    "HttpOnly",
    "SameSite=Lax",
    getSecureCookieAttribute(),
  ]
    .filter(Boolean)
    .join("; ");

const getSecureCookieAttribute = () =>
  new URL(env.NEXTAUTH_URL).protocol === "https:" ? "Secure" : "";

const throwInvalidOAuthState = (): never => {
  throw new ORPCError("BAD_REQUEST", { message: "Invalid OAuth state" });
};
