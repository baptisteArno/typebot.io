import { ORPCError } from "@orpc/server";
import { env } from "@typebot.io/env";

const trustedOrigins = env.NEXT_PUBLIC_VIEWER_URL;

export const assertOriginIsAllowed = (
  origin: string | undefined,
  {
    allowedOrigins,
    iframeReferrerOrigin,
  }: {
    allowedOrigins: string[] | undefined;
    iframeReferrerOrigin: string | undefined;
  },
) => {
  if (
    !origin ||
    !allowedOrigins ||
    allowedOrigins.length === 0 ||
    allowedOrigins.includes(origin) ||
    (iframeReferrerOrigin &&
      trustedOrigins.includes(origin) &&
      allowedOrigins.includes(iframeReferrerOrigin))
  )
    return;
  throw new ORPCError("FORBIDDEN", {
    message: "Origin not allowed",
  });
};
