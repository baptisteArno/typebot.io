import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
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
  } else if (pathname === "/typebots") {
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
  matcher: ["/", "/typebots"],
};
