import { afterEach, expect, it } from "bun:test";
import { createHmac } from "node:crypto";
import { sessionBinding, verifyHostRequest } from "./trustedContext";

const signingKey = "test-signing-key-with-at-least-32-bytes";
const bindingKey = "test-binding-key-with-at-least-32-bytes";
const previous = {
  service: process.env.HOST_BRIDGE_SERVICE_KEY,
  signing: process.env.HOST_EXECUTION_CONTEXT_SIGNING_KEY,
  binding: process.env.HOST_SESSION_BINDING_KEY,
};
const now = Math.floor(Date.now() / 1000);
const envelope = (overrides: Record<string, unknown> = {}) => ({
  version: 1,
  iss: "example-host",
  aud: "botflow-host-action",
  flowId: "flow-a",
  executionId: "execution-a",
  iat: now,
  exp: now + 60,
  claims: { tenant: "a", principal: { opaque: "user-a" } },
  ...overrides,
});
const signed = (value: unknown) => {
  const payload = Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${payload}.${createHmac("sha256", signingKey).update(payload).digest("base64url")}`;
};
const request = (token: string, serviceKey = "bridge-service-secret") =>
  new Request("http://localhost/api/internal/host/start", {
    method: "POST",
    headers: {
      "x-host-service-key": serviceKey,
      "x-host-execution-context": token,
    },
  });

afterEach(() => {
  process.env.HOST_BRIDGE_SERVICE_KEY = previous.service;
  process.env.HOST_EXECUTION_CONTEXT_SIGNING_KEY = previous.signing;
  process.env.HOST_SESSION_BINDING_KEY = previous.binding;
});

it("accepts an opaque Host claims object and binds the session to it", () => {
  process.env.HOST_BRIDGE_SERVICE_KEY = "bridge-service-secret";
  process.env.HOST_EXECUTION_CONTEXT_SIGNING_KEY = signingKey;
  process.env.HOST_SESSION_BINDING_KEY = bindingKey;
  const trusted = verifyHostRequest(request(signed(envelope())), now);
  expect(trusted.envelope.claims).toEqual({
    tenant: "a",
    principal: { opaque: "user-a" },
  });
  expect(sessionBinding("session-a", trusted.envelope)).toBe(
    sessionBinding(
      "session-a",
      envelope({
        claims: { principal: { opaque: "user-a" }, tenant: "a" },
      }) as never,
    ),
  );
  expect(
    sessionBinding(
      "session-a",
      envelope({
        claims: { tenant: "a", principal: { opaque: "user-b" } },
      }) as never,
    ),
  ).not.toBe(sessionBinding("session-a", trusted.envelope));
});

it("rejects missing caller auth, expiration, wrong audience, tampering and extra envelope fields", () => {
  process.env.HOST_BRIDGE_SERVICE_KEY = "bridge-service-secret";
  process.env.HOST_EXECUTION_CONTEXT_SIGNING_KEY = signingKey;
  process.env.HOST_SESSION_BINDING_KEY = bindingKey;
  expect(() =>
    verifyHostRequest(request(signed(envelope()), "bad"), now),
  ).toThrow();
  expect(() =>
    verifyHostRequest(request(signed(envelope({ exp: now - 1 }))), now),
  ).toThrow();
  expect(() =>
    verifyHostRequest(request(signed(envelope({ aud: "wrong" }))), now),
  ).toThrow();
  expect(() =>
    verifyHostRequest(request(`${signed(envelope())}x`), now),
  ).toThrow();
  expect(() =>
    verifyHostRequest(request(signed(envelope({ role: "admin" }))), now),
  ).toThrow();
});
