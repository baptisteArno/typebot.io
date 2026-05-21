import { describe, expect, it } from "bun:test";

process.env.SKIP_ENV_CHECK = "true";
process.env.ENCRYPTION_SECRET = "12345678901234567890123456789012";
process.env.NEXTAUTH_URL = "https://app.typebot.io";

const {
  clearGoogleSheetsOAuthStateCookie,
  createGoogleSheetsOAuthState,
  googleSheetsOAuthStateCookieName,
  googleSheetsOAuthContextSchema,
  parseGoogleSheetsOAuthState,
} = await import("./googleSheetsOAuthState");

describe("googleSheetsOAuthState", () => {
  it("round trips a signed OAuth state", () => {
    const input = googleSheetsOAuthContextSchema.parse({
      redirectUrl: "https://app.typebot.io/typebots/typebot-id/edit?foo=bar",
      workspaceId: "workspace-id",
      typebotId: "typebot-id",
      blockId: "block-id",
    });

    const { state, cookie } = createGoogleSheetsOAuthState({
      input,
      userId: "user-id",
    });

    const parsedState = parseGoogleSheetsOAuthState(state);

    expect(parsedState).toMatchObject({
      userId: "user-id",
      workspaceId: "workspace-id",
      redirectPath: "/typebots/typebot-id/edit",
      typebotId: "typebot-id",
      blockId: "block-id",
    });
    expect(cookie).toContain(
      `${googleSheetsOAuthStateCookieName}=${parsedState.nonce}`,
    );
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
  });

  it("falls back to the dashboard for off-origin redirects", () => {
    const input = googleSheetsOAuthContextSchema.parse({
      redirectUrl: "https://evil.example/typebots/typebot-id/edit",
      workspaceId: "workspace-id",
    });

    const { state } = createGoogleSheetsOAuthState({
      input,
      userId: "user-id",
    });

    expect(parseGoogleSheetsOAuthState(state).redirectPath).toBe("/typebots");
  });

  it("falls back to the dashboard for scheme-relative redirect paths", () => {
    const input = googleSheetsOAuthContextSchema.parse({
      redirectUrl: "https://app.typebot.io//evil.example/path",
      workspaceId: "workspace-id",
    });

    const { state } = createGoogleSheetsOAuthState({
      input,
      userId: "user-id",
    });

    expect(parseGoogleSheetsOAuthState(state).redirectPath).toBe("/typebots");
  });

  it("rejects tampered state payloads", () => {
    const input = googleSheetsOAuthContextSchema.parse({
      workspaceId: "workspace-id",
    });
    const { state } = createGoogleSheetsOAuthState({
      input,
      userId: "user-id",
    });
    const [encodedPayload, signature] = state.split(".");
    if (!encodedPayload || !signature) throw new Error("Invalid test state");

    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString(),
    );
    const tamperedPayload = Buffer.from(
      JSON.stringify({ ...payload, workspaceId: "other-workspace-id" }),
    ).toString("base64url");

    expect(() =>
      parseGoogleSheetsOAuthState(`${tamperedPayload}.${signature}`),
    ).toThrow();
  });

  it("requires typebotId and blockId to be provided together", () => {
    expect(() =>
      googleSheetsOAuthContextSchema.parse({
        workspaceId: "workspace-id",
        typebotId: "typebot-id",
      }),
    ).toThrow();
  });

  it("serializes a clearing cookie", () => {
    expect(clearGoogleSheetsOAuthStateCookie()).toContain(
      `${googleSheetsOAuthStateCookieName}=; Max-Age=0`,
    );
  });
});
