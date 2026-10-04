import { env } from "@typebot.io/env";
import { NextResponse } from "next/server";

// These headers depend on deployment configuration, not on page rendering.
// Keep them at request time so a standalone image can use a runtime builder URL.
export function proxy() {
  const response = NextResponse.next();
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set(
    "Content-Security-Policy",
    `frame-ancestors ${[new URL(env.NEXTAUTH_URL).origin, ...env.HOST_STUDIO_EMBED_ALLOWED_ORIGINS].join(" ")}; worker-src 'none'; object-src 'none'; base-uri 'none'`,
  );
  return response;
}

export const config = { matcher: ["/__preview"] };
