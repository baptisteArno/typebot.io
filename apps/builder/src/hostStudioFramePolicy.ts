import { isAllowedHostStudioOrigin } from "@typebot.io/env/hostStudioEmbedOrigins";

const locales = new Set([
  "en",
  "fr",
  "pt",
  "pt-BR",
  "de",
  "ro",
  "es",
  "it",
  "el",
]);

export const isStudioRoute = (pathname: string) => {
  const [, locale] = pathname.split("/");
  const route = locales.has(locale)
    ? pathname.slice(locale.length + 1)
    : pathname;
  return route === "/typebots" || route.startsWith("/typebots/");
};

export const getStudioFramePolicyHeaders = (
  origins: string[],
  nodeEnv = process.env.NODE_ENV,
) => {
  const allowedOrigins = [...new Set(origins)];
  if (
    !allowedOrigins.every((origin) =>
      isAllowedHostStudioOrigin(origin, nodeEnv),
    )
  )
    throw new Error("Invalid HOST_STUDIO_EMBED_ALLOWED_ORIGINS");

  const isDev = nodeEnv !== "production";
  const frameAncestors = ["'self'", ...allowedOrigins].join(" ");
  const contentSecurityPolicy = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https:${
      isDev ? " http://localhost:* " : ""
    }`,
    "style-src 'self' 'unsafe-inline' https:",
    `connect-src 'self' https: wss:${
      isDev ? " http://localhost:* ws://localhost:*" : ""
    }`,
    "frame-src 'self' https: http:",
    `img-src 'self' data: blob: https:${isDev ? " http://localhost:*" : ""}`,
    "font-src 'self' https: data:",
    `media-src 'self' blob: https:${isDev ? " http://localhost:* " : ""}`,
    "worker-src 'self' blob:",
    "object-src 'none'",
    `frame-ancestors ${frameAncestors}`,
    "form-action 'self'",
    "base-uri 'self'",
  ].join("; ");

  return {
    "Content-Security-Policy": contentSecurityPolicy,
    ...(allowedOrigins.length ? {} : { "X-Frame-Options": "SAMEORIGIN" }),
  };
};
