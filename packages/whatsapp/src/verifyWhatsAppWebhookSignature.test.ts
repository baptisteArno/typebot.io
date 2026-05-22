import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyWhatsAppWebhookSignature } from "./verifyWhatsAppWebhookSignature";

describe("verifyWhatsAppWebhookSignature", () => {
  it("matches the documented x-hub-signature-256 test vector", () => {
    expect(
      verifyWhatsAppWebhookSignature({
        appSecret: "It's a Secret to Everybody",
        rawBody: "Hello, World!",
        signature:
          "sha256=757107ea0eb2509fc211221cce984b8a37570b6d7586c22c46f4379c8b043e17",
      }),
    ).toBe(true);
  });

  it("returns true when the signature matches the raw body", () => {
    const rawBody = JSON.stringify({ entry: [] });
    const appSecret = "secret";
    const signature = `sha256=${createHmac("sha256", appSecret)
      .update(rawBody)
      .digest("hex")}`;

    expect(
      verifyWhatsAppWebhookSignature({
        appSecret,
        rawBody,
        signature,
      }),
    ).toBe(true);
  });

  it("returns false when the signature is missing or invalid", () => {
    expect(
      verifyWhatsAppWebhookSignature({
        appSecret: "secret",
        rawBody: JSON.stringify({ entry: [] }),
        signature: undefined,
      }),
    ).toBe(false);

    expect(
      verifyWhatsAppWebhookSignature({
        appSecret: "secret",
        rawBody: JSON.stringify({ entry: [] }),
        signature: "sha256=invalid",
      }),
    ).toBe(false);
  });

  it("returns false instead of throwing when the signature has invalid bytes", () => {
    expect(
      verifyWhatsAppWebhookSignature({
        appSecret: "secret",
        rawBody: JSON.stringify({ entry: [] }),
        signature: `sha256=${"é".repeat(64)}`,
      }),
    ).toBe(false);
  });
});
