import { expect, it } from "bun:test";
import { isAllowedHostStudioOrigin } from "@typebot.io/env/hostStudioEmbedOrigins";
import {
  getStudioFramePolicyHeaders,
  isStudioRoute,
} from "./hostStudioFramePolicy";

it("accepts HTTPS exact origins and development localhost only", () => {
  expect(isAllowedHostStudioOrigin("https://host.example", "production")).toBe(
    true,
  );
  expect(
    isAllowedHostStudioOrigin("http://localhost:3000", "development"),
  ).toBe(true);
  for (const value of [
    "*",
    "https://*.example",
    "not-a-url",
    "javascript:alert(1)",
    "https://host.example/path",
    "https://host.example?x=1",
    "https://host.example#hash",
    "http://host.example",
    "http://localhost:3000",
  ])
    expect(isAllowedHostStudioOrigin(value, "production")).toBe(false);
});

it("uses a self-only policy and SAMEORIGIN when no Host is configured", () => {
  const headers = getStudioFramePolicyHeaders([], "production");
  expect(headers["Content-Security-Policy"]).toContain(
    "frame-ancestors 'self'",
  );
  expect(headers["X-Frame-Options"]).toBe("SAMEORIGIN");
});

it("allows only configured exact origins and omits conflicting XFO", () => {
  const headers = getStudioFramePolicyHeaders(
    ["https://host-one.example", "https://host-two.example"],
    "production",
  );
  expect(headers["Content-Security-Policy"]).toContain(
    "frame-ancestors 'self' https://host-one.example https://host-two.example",
  );
  expect(headers).not.toHaveProperty("X-Frame-Options");
  expect(() => getStudioFramePolicyHeaders(["*"], "production")).toThrow();
});

it("scopes runtime framing to Studio routes", () => {
  for (const path of [
    "/typebots",
    "/typebots/create",
    "/typebots/id/edit",
    "/fr/typebots/create",
  ])
    expect(isStudioRoute(path)).toBe(true);
  for (const path of ["/signin", "/api/auth/signin", "/workspaces/typebots/id"])
    expect(isStudioRoute(path)).toBe(false);
});
