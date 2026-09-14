import { env } from "@typebot.io/env";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isSameOriginRequest } from "./features/auth/helpers/isSameOriginRequest";

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
          ? new URL(callbackUrl).searchParams.get("redirectPath")
          : undefined),
    );
    if (!redirectPath) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = redirectPath;
    url.searchParams.delete("callbackUrl");
    url.searchParams.delete("redirectPath");
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

function sanitizeRedirectPath(
  redirectPath: string | null | undefined,
): string | null {
  if (!redirectPath) return null;

  try {
    // Prevent absolute URLs
    const url = new URL(redirectPath, "http://dummy"); // base needed for parsing
    if (url.origin !== "http://dummy") return null; // absolute external URL → reject

    const safePath = url.pathname + url.search + url.hash;

    return safePath;
  } catch {
    return null;
  }
}

export const config = {
  matcher: [
    "/api/:path*",
    "/",
    "/typebots",
    "/signin",
    "/register",
    "/__ENV.js",
    "/favicon.svg",
    "/robots.txt",
    "/sitemap.xml",
  ],
};
