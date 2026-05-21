import { env } from "@typebot.io/env";

export const getUploadProxyBaseUrl = (apiOrigin: string | undefined) =>
  apiOrigin ?? env.NEXT_PUBLIC_VIEWER_URL[0] ?? env.NEXTAUTH_URL;
