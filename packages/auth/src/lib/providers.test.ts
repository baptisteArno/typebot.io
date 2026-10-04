import { Auth, type AuthConfig, customFetch } from "@auth/core";
import { exportJWK, generateKeyPair, SignJWT } from "jose";
import { expect, it, vi } from "vitest";

vi.mock("../helpers/sendVerificationRequest", () => ({
  sendVerificationRequest: vi.fn(),
}));

vi.mock("@typebot.io/env", () => ({
  env: {
    CUSTOM_OAUTH_ISSUER: "https://identity.example.test",
    CUSTOM_OAUTH_CLIENT_ID: "generic-builder",
    CUSTOM_OAUTH_CLIENT_SECRET: "test-only-client-secret",
    CUSTOM_OAUTH_SCOPE: "openid profile email",
    CUSTOM_OAUTH_USER_ID_PATH: "sub",
    CUSTOM_OAUTH_USER_EMAIL_PATH: "email",
    CUSTOM_OAUTH_USER_NAME_PATH: "name",
    CUSTOM_OAUTH_USER_IMAGE_PATH: "picture",
    CUSTOM_OAUTH_NAME: "Generic Host",
  },
}));

it("completes Custom OAuth when profile claims are only in UserInfo", async () => {
  const { providers } = await import("./providers");
  const provider = providers.find(
    (value) => typeof value !== "function" && value.id === "custom-oauth",
  );
  if (!provider || typeof provider === "function" || provider.type !== "oidc")
    throw new Error("Custom OAuth provider is required");

  const issuer = "https://identity.example.test";
  const origin = "https://builder.example.test";
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const idToken = await new SignJWT({ sub: "immutable-demo-user" })
    .setProtectedHeader({ alg: "RS256", kid: "test-key" })
    .setIssuer(issuer)
    .setAudience("generic-builder")
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(privateKey);
  const requests: string[] = [];
  let pkceVerified = false;
  const fetchProvider = (async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => {
    const url = String(input instanceof Request ? input.url : input);
    requests.push(url);
    if (url.endsWith("/.well-known/openid-configuration"))
      return Response.json({
        issuer,
        authorization_endpoint: `${issuer}/authorize`,
        token_endpoint: `${issuer}/token`,
        jwks_uri: `${issuer}/jwks`,
        userinfo_endpoint: `${issuer}/userinfo`,
        response_types_supported: ["code"],
        subject_types_supported: ["public"],
        id_token_signing_alg_values_supported: ["RS256"],
        code_challenge_methods_supported: ["S256"],
      });
    if (url.endsWith("/jwks"))
      return Response.json({
        keys: [{ ...(await exportJWK(publicKey)), kid: "test-key" }],
      });
    if (url.endsWith("/token")) {
      pkceVerified = new URLSearchParams(String(init?.body)).has(
        "code_verifier",
      );
      return Response.json({
        id_token: idToken,
        access_token: "test-only-access-token",
        token_type: "Bearer",
      });
    }
    if (url.endsWith("/userinfo"))
      return Response.json({
        sub: "immutable-demo-user",
        email: "manager@example.test",
        name: "Project B Manager",
      });
    throw new Error("Unexpected OIDC endpoint");
  }) as typeof fetch;
  const signIn = vi.fn(() => true);
  const config: AuthConfig = {
    secret: "test-only-session-secret-at-least-32-characters",
    trustHost: true,
    basePath: "/api/auth",
    providers: [{ ...provider, [customFetch]: fetchProvider }],
    callbacks: { signIn },
    logger: { error: vi.fn() },
  };
  const cookies = new Map<string, string>();
  const rememberCookies = (response: Response) => {
    for (const value of response.headers.getSetCookie()) {
      const pair = value.split(";")[0];
      const index = pair.indexOf("=");
      cookies.set(pair.slice(0, index), pair.slice(index + 1));
    }
  };
  const cookieHeader = () =>
    [...cookies].map(([key, value]) => `${key}=${value}`).join("; ");

  const csrf = await Auth(new Request(`${origin}/api/auth/csrf`), config);
  rememberCookies(csrf);
  const { csrfToken } = await csrf.json();
  const start = await Auth(
    new Request(`${origin}/api/auth/signin/custom-oauth`, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        cookie: cookieHeader(),
      },
      body: new URLSearchParams({
        csrfToken,
        callbackUrl: `${origin}/typebots`,
      }),
    }),
    config,
  );
  rememberCookies(start);
  const authorization = new URL(start.headers.get("location")!);
  expect(authorization.searchParams.get("code_challenge_method")).toBe("S256");
  const callback = new URL(`${origin}/api/auth/callback/custom-oauth`);
  callback.searchParams.set("code", "test-only-authorization-code");
  callback.searchParams.set("state", authorization.searchParams.get("state")!);
  const invalidState = new URL(callback);
  invalidState.searchParams.set("state", "tampered-state");
  const rejected = await Auth(
    new Request(invalidState, { headers: { cookie: cookieHeader() } }),
    config,
  );
  expect(rejected.headers.get("location")).toContain("error=");
  expect(signIn).not.toHaveBeenCalled();
  expect(requests).not.toContain(`${issuer}/token`);
  const result = await Auth(
    new Request(callback, { headers: { cookie: cookieHeader() } }),
    config,
  );

  expect(result.headers.get("location")).toBe(`${origin}/typebots`);
  expect(signIn).toHaveBeenCalledWith(
    expect.objectContaining({
      user: expect.objectContaining({ email: "manager@example.test" }),
      account: expect.objectContaining({
        provider: "custom-oauth",
        providerAccountId: "immutable-demo-user",
      }),
    }),
  );
  expect(requests).toContain(`${issuer}/userinfo`);
  expect(pkceVerified).toBe(true);
});
