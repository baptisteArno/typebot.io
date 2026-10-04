import { expect, test } from "bun:test";
import { env } from "@typebot.io/env";
import { proxy } from "./proxy";

test("preview framing allows only Builder and configured Host origins", () => {
  const policy = proxy().headers.get("Content-Security-Policy");

  expect(policy).toBe(
    `frame-ancestors ${[new URL(env.NEXTAUTH_URL).origin, ...env.HOST_STUDIO_EMBED_ALLOWED_ORIGINS].join(" ")}; worker-src 'none'; object-src 'none'; base-uri 'none'`,
  );
  expect(policy).not.toContain("*");
});
