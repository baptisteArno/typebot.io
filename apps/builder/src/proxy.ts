import { sanitizeRedirectPath } from "@typebot.io/auth/helpers/sanitizeRedirectPath";
import { env } from "@typebot.io/env";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isSameOriginRequest } from "./features/auth/helpers/isSameOriginRequest";
import {
  getStudioFramePolicyHeaders,
  isStudioRoute,
} from "./hostStudioFramePolicy";

const disallowedMethods = new Set(["OPTIONS", "TRACE", "TRACK"]);

export function proxy(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/api/")) {
    // Auth.js validates CSRF tokens and OAuth state itself and needs cookies on
    // cross-origin provider callbacks. Application APIs must not inherit them.
    if (
      req.nextUrl.pathname.startsWith("/api/auth/") ||
      // This callback checks a signed, expiring state bound to the signed-in
      // user and an HttpOnly nonce cookie before changing any credentials.
      (req.method === "GET" &&
        req.nextUrl.pathname === "/api/credentials/google-sheets/callback")
    )
      return NextResponse.next();
    const headers = new Headers(req.headers);
    if (!isSameOriginRequest(headers, env.NEXTAUTH_URL))
      headers.delete("cookie");
    return NextResponse.next({ request: { headers } });
  }

  if (disallowedMethods.has(req.method))
    return new NextResponse(null, {
      status: 405,
      headers: {
        Allow: "GET, HEAD",
      },
    });

  const { pathname, locale, defaultLocale, searchParams } = req.nextUrl;

  const isMostLikelySignedIn = Boolean(
    req.cookies.get("__Secure-authjs.session-token") ??
      req.cookies.get("authjs.session-token"),
  );

  if (pathname === "/") {
    const toSignedIn =
      locale && locale !== defaultLocale ? `/${locale}/typebots` : "/typebots";
    const toSignin =
      locale && locale !== defaultLocale ? `/${locale}/signin` : "/signin";

    const url = req.nextUrl.clone();
    url.pathname = isMostLikelySignedIn ? toSignedIn : toSignin;

    return NextResponse.redirect(url);
  }
  if (pathname === "/typebots") {
    const callbackUrl = searchParams.get("callbackUrl");
    const redirectPath = sanitizeRedirectPath(
      searchParams.get("redirectPath") ??
        (callbackUrl
          ? getCallbackRedirectPath(callbackUrl, req.url)
          : undefined),
    );
    if (!redirectPath)
      return withStudioFramePolicy(pathname, NextResponse.next());
    const url = req.nextUrl.clone();
    const destination = new URL(redirectPath, req.url);
    url.pathname = destination.pathname;
    url.search = destination.search;
    url.hash = destination.hash;
    return NextResponse.redirect(url);
  }
  return withStudioFramePolicy(pathname, NextResponse.next());
}

function withStudioFramePolicy(
  pathname: string,
  response: NextResponse,
): NextResponse {
  if (!isStudioRoute(pathname)) return response;

  const headers = getStudioFramePolicyHeaders(
    env.HOST_STUDIO_EMBED_ALLOWED_ORIGINS,
    process.env.NODE_ENV,
  );
  for (const [name, value] of Object.entries(headers))
    response.headers.set(name, value);
  if (!("X-Frame-Options" in headers))
    response.headers.delete("X-Frame-Options");
  return response;
}

function getCallbackRedirectPath(callbackUrl: string, baseUrl: string) {
  try {
    return new URL(callbackUrl, baseUrl).searchParams.get("redirectPath");
  } catch {
    return null;
  }
}

export const config = {
  matcher: [
    "/api/:path*",
    "/",
    "/typebots",
    "/typebots/:path*",
    "/:locale/typebots/:path*",
    "/signin",
    "/register",
    "/__ENV.js",
    "/favicon.svg",
    "/robots.txt",
    "/sitemap.xml",
  ],
};
