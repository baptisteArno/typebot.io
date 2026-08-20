import { beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import { HttpMethod } from "@typebot.io/blocks-integrations/httpRequest/constants";
import { TimeoutError } from "ky";

let nextRequestError: unknown;

const safeKyMock = mock(async () => {
  if (nextRequestError) throw nextRequestError;
  return new Response('{"status":"ok"}', { status: 200 });
});

mock.module("@typebot.io/lib/ky", () => ({
  rebuildFetchWithoutChunkedEncoding: mock(
    async () => new Response(undefined, { status: 200 }),
  ),
  safeKy: safeKyMock,
}));

mock.module("@typebot.io/lib/parseUnknownError", () => ({
  parseUnknownError: mock(async () => ({
    description: "Network request failed",
  })),
}));

mock.module("@typebot.io/lib/ssrf/validateHttpReqUrl", () => ({
  validateHttpReqHeaders: mock(),
  validateHttpReqUrl: mock(async () => undefined),
}));

mock.module("@typebot.io/prisma", () => ({
  default: {
    webhook: {
      findUnique: mock(),
    },
  },
}));

const { executeHttpRequest, webhookErrorDescription } = await import(
  "./executeHttpRequestBlock"
);
const { filterPotentiallySensitiveLogs } = await import(
  "../../../logs/filterPotentiallySensitiveLogs"
);

const headerSecret = "header-secret-value";
const basicAuthUsername = "basic-auth-user";
const basicAuthPassword = "basic-auth-password";

describe("executeHttpRequest", () => {
  beforeEach(() => {
    nextRequestError = undefined;
    safeKyMock.mockClear();
  });

  it("keeps headers and basic auth credentials out of timeout logs", async () => {
    nextRequestError = new TimeoutError(
      new Request("https://example.com/webhook"),
    );

    const result = await executeHttpRequest(buildHttpRequest());

    expect(result.response.statusCode).toBe(408);
    assertWebhookErrorLogIsSafe(result.logs);
  });

  it("keeps headers and basic auth credentials out of generic failure logs", async () => {
    nextRequestError = new Error("Network request failed");
    const consoleErrorSpy = spyOn(console, "error").mockImplementation(
      () => undefined,
    );

    try {
      const result = await executeHttpRequest(buildHttpRequest());

      expect(result.response.statusCode).toBe(500);
      assertWebhookErrorLogIsSafe(result.logs);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});

const buildHttpRequest = () => ({
  url: "https://example.com/webhook",
  method: HttpMethod.POST,
  headers: {
    Authorization: `Bearer ${headerSecret}`,
    "X-Webhook-Secret": headerSecret,
  },
  basicAuth: {
    username: basicAuthUsername,
    password: basicAuthPassword,
  },
  body: { event: "test" },
  isJson: true,
});

const assertWebhookErrorLogIsSafe = (
  logs: Awaited<ReturnType<typeof executeHttpRequest>>["logs"],
) => {
  const log = logs?.at(0);
  if (!log?.details) throw new Error("Expected webhook error log details");

  expect(log.description).toBe(webhookErrorDescription);
  expect(filterPotentiallySensitiveLogs(log)).toBe(false);
  expect(log.details).toContain("https://example.com/webhook");
  expect(log.details).not.toContain('"headers"');
  expect(log.details).not.toContain('"username"');
  expect(log.details).not.toContain('"password"');
  expect(log.details).not.toContain(headerSecret);
  expect(log.details).not.toContain(basicAuthUsername);
  expect(log.details).not.toContain(basicAuthPassword);
};
