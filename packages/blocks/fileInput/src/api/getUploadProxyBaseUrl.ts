import { env } from "@typebot.io/env";
import { resolveUploadProxyBaseUrl } from "@typebot.io/lib/s3/resolveUploadProxyBaseUrl";

export const getUploadProxyBaseUrl = (apiOrigin: string | undefined) =>
  resolveUploadProxyBaseUrl({
    publicBaseUrls: env.NEXT_PUBLIC_VIEWER_URL,
    fallbackBaseUrl: env.NEXTAUTH_URL,
    requestOrigin: apiOrigin,
  });
