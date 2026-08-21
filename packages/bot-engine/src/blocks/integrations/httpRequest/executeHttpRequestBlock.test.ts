import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import { HttpMethod } from "@typebot.io/blocks-integrations/httpRequest/constants";
import { TimeoutError } from "ky";

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
const webhookUrl = "https://93.184.216.34/webhook";
const originalFetch = globalThis.fetch;

describe("executeHttpRequest", () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("keeps headers and basic auth credentials out of timeout logs", async () => {
    replaceFetchWithError(new TimeoutError(new Request(webhookUrl)));

    const result = await executeHttpRequest(buildHttpRequest());

    expect(result.response.statusCode).toBe(408);
    assertWebhookErrorLogIsSafe(result.logs);
  });

  it("keeps headers and basic auth credentials out of generic failure logs", async () => {
    replaceFetchWithError(new Error("Network request failed"));
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
  url: webhookUrl,
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
  expect(log.details).toContain(webhookUrl);
  expect(log.details).not.toContain('"headers"');
  expect(log.details).not.toContain('"username"');
  expect(log.details).not.toContain('"password"');
  expect(log.details).not.toContain(headerSecret);
  expect(log.details).not.toContain(basicAuthUsername);
  expect(log.details).not.toContain(basicAuthPassword);
};

const replaceFetchWithError = (error: unknown) => {
  globalThis.fetch = Object.assign(
    async () => {
      throw error;
    },
    { preconnect: originalFetch.preconnect },
  );
};
