import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, locale, defaultLocale } = req.nextUrl;

  // Only handle homepage
  if (pathname !== "/") return NextResponse.next();

  const token =
    req.cookies.get("__Secure-authjs.session-token") ??
    req.cookies.get("authjs.session-token");

  const toSignedIn =
    locale && locale !== defaultLocale ? `/${locale}/typebots` : "/typebots";
  const toSignin =
    locale && locale !== defaultLocale ? `/${locale}/signin` : "/signin";

  const url = req.nextUrl.clone();
  url.pathname = token ? toSignedIn : toSignin;

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/"],
};
