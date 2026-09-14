import { expect, test } from "@playwright/test";

for (const path of [
  "/api/v1/typebots/bot/unpublish",
  "/api/orpc/typebot/updateTypebot",
  "/api/v2/sessions/session/streamMessage",
  "/api/credentials/google-sheets/callback",
])
  test(`strips every cookie before authenticating ${path}, preserving Bearer auth`, async ({
    request,
  }) => {
    const response = await request.post("/proxy-response", {
      data: {
        path,
        method: "POST",
        headers: {
          "sec-fetch-site": "same-site",
          cookie:
            "authjs.session-token=owner; __Secure-authjs.session-token.0=chunk; __Secure-authjs.session-token.1=chunk",
          authorization: "Bearer explicit-api-token",
          "content-type": "text/plain",
        },
      },
    });
    expect(response.headers()["x-middleware-override-headers"]).not.toContain(
      "cookie",
    );
    expect(response.headers()["x-middleware-request-cookie"]).toBeUndefined();
    expect(response.headers()["x-middleware-request-authorization"]).toBe(
      "Bearer explicit-api-token",
    );
    expect(response.headers()["x-middleware-request-content-type"]).toBe(
      "text/plain",
    );
  });

test("keeps same-origin cookie authentication and API OPTIONS handling", async ({
  request,
}) => {
  for (const method of ["GET", "POST", "OPTIONS"]) {
    const response = await request.post("/proxy-response", {
      data: {
        path: "/api/v1/typebots",
        method,
        headers: {
          "sec-fetch-site": "same-origin",
          cookie: "authjs.session-token=owner",
        },
      },
    });
    expect(response.status()).toBe(200);
    expect(response.headers()["x-middleware-request-cookie"]).toBe(
      "authjs.session-token=owner",
    );
  }
});

test("leaves protected OAuth callbacks and ordinary page navigation unchanged", async ({
  request,
}) => {
  for (const path of [
    "/api/auth/callback/google",
    "/api/credentials/google-sheets/callback",
    "/signin",
  ]) {
    const response = await request.post("/proxy-response", {
      data: {
        path,
        headers: {
          "sec-fetch-site": "cross-site",
          cookie: "oauth-state=state",
        },
      },
    });
    expect(response.headers()["x-middleware-next"]).toBe("1");
    expect(response.headers()["x-middleware-override-headers"]).toBeUndefined();
  }
});
