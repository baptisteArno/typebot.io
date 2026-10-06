import { Auth, type AuthConfig, customFetch } from "@auth/core";
import { exportJWK, generateKeyPair, SignJWT } from "jose";
import { beforeEach, expect, it, vi } from "vitest";

const testEnv = vi.hoisted(() => ({
  CUSTOM_OAUTH_ISSUER: "https://identity.example.test",
  CUSTOM_OAUTH_CLIENT_ID: "generic-builder",
  CUSTOM_OAUTH_CLIENT_SECRET: "test-only-client-secret",
  CUSTOM_OAUTH_SCOPE: "openid profile email",
  CUSTOM_OAUTH_USER_ID_PATH: "sub",
  CUSTOM_OAUTH_USER_EMAIL_PATH: "email",
  CUSTOM_OAUTH_USER_NAME_PATH: "name",
  CUSTOM_OAUTH_USER_IMAGE_PATH: "picture",
  CUSTOM_OAUTH_NAME: "Generic Host",
  CUSTOM_OAUTH_USE_USERINFO: undefined as boolean | undefined,
}));

vi.mock("../helpers/sendVerificationRequest", () => ({
  sendVerificationRequest: vi.fn(),
}));
vi.mock("@typebot.io/env", () => ({ env: testEnv }));

beforeEach(() => {
  testEnv.CUSTOM_OAUTH_USER_ID_PATH = "sub";
  testEnv.CUSTOM_OAUTH_USER_EMAIL_PATH = "email";
  testEnv.CUSTOM_OAUTH_USER_NAME_PATH = "name";
  testEnv.CUSTOM_OAUTH_USE_USERINFO = undefined;
  vi.resetModules();
});

const signInWithCustomOAuth = async ({
  idTokenClaims,
  userInfo,
  userIdPath = "sub",
}: {
  idTokenClaims: Record<string, unknown>;
  userInfo?: Record<string, unknown>;
  userIdPath?: string;
}) => {
  testEnv.CUSTOM_OAUTH_USER_ID_PATH = userIdPath;
  const { providers } = await import("./providers");
  const provider = providers.find(
    (value) => typeof value !== "function" && value.id === "custom-oauth",
  );
  if (!provider || typeof provider === "function" || provider.type !== "oidc")
    throw new Error("Custom OAuth provider is required");

  const issuer = "https://identity.example.test";
  const origin = "https://builder.example.test";
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const idToken = await new SignJWT(idTokenClaims)
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
    if (url.endsWith("/userinfo")) return Response.json(userInfo ?? {});
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

  return { result, signIn, requests, pkceVerified };
};

it.each([
  ["absent", undefined],
  ["false", false],
] as const)("preserves ID Token profile behavior when the flag is %s", async (_, flag) => {
  testEnv.CUSTOM_OAUTH_USE_USERINFO = flag;
  const { result, signIn, requests, pkceVerified } =
    await signInWithCustomOAuth({
      idTokenClaims: {
        sub: "token-subject",
        email: "manager@example.test",
        account_id: "configured-account-id",
      },
      userInfo: {
        sub: "different-userinfo-subject",
        email: "different@example.test",
      },
      userIdPath: "account_id",
    });

  expect(result.headers.get("location")).toBe(
    "https://builder.example.test/typebots",
  );
  expect(signIn).toHaveBeenCalledWith(
    expect.objectContaining({
      user: expect.objectContaining({
        email: "manager@example.test",
      }),
      profile: expect.objectContaining({
        account_id: "configured-account-id",
      }),
      account: expect.objectContaining({
        provider: "custom-oauth",
        providerAccountId: "configured-account-id",
      }),
    }),
  );
  expect(requests).not.toContain("https://identity.example.test/userinfo");
  expect(pkceVerified).toBe(true);
});

it("does not switch linked account identity to a differing UserInfo subject by default", async () => {
  const { signIn, requests } = await signInWithCustomOAuth({
    idTokenClaims: {
      sub: "existing-user-id",
      email: "manager@example.test",
    },
    userInfo: {
      sub: "different-user-id",
      email: "manager@example.test",
    },
  });

  expect(signIn).toHaveBeenCalledWith(
    expect.objectContaining({
      account: expect.objectContaining({
        providerAccountId: "existing-user-id",
      }),
    }),
  );
  expect(requests).not.toContain("https://identity.example.test/userinfo");
});

it("uses UserInfo profile claims only when explicitly enabled", async () => {
  testEnv.CUSTOM_OAUTH_USE_USERINFO = true;
  const { result, signIn, requests, pkceVerified } =
    await signInWithCustomOAuth({
      idTokenClaims: { sub: "immutable-demo-user" },
      userInfo: {
        sub: "immutable-demo-user",
        email: "manager@example.test",
        name: "Project B Manager",
      },
    });

  expect(result.headers.get("location")).toBe(
    "https://builder.example.test/typebots",
  );
  expect(signIn).toHaveBeenCalledWith(
    expect.objectContaining({
      user: expect.objectContaining({
        email: "manager@example.test",
        name: "Project B Manager",
      }),
      account: expect.objectContaining({
        provider: "custom-oauth",
        providerAccountId: "immutable-demo-user",
      }),
    }),
  );
  expect(requests).toContain("https://identity.example.test/userinfo");
  expect(pkceVerified).toBe(true);
});
