import { describe, expect, it } from "vitest";
import { verifyWhatsAppWebhookSecret } from "./verifyWhatsAppWebhookSecret";

describe("verifyWhatsAppWebhookSecret", () => {
  it("returns true when the received secret matches", () => {
    expect(
      verifyWhatsAppWebhookSecret({
        expectedSecret: "secret",
        receivedSecret: "secret",
      }),
    ).toBe(true);
  });

  it("returns false when the received secret is missing or invalid", () => {
    expect(
      verifyWhatsAppWebhookSecret({
        expectedSecret: "secret",
        receivedSecret: undefined,
      }),
    ).toBe(false);

    expect(
      verifyWhatsAppWebhookSecret({
        expectedSecret: "secret",
        receivedSecret: "invalid",
      }),
    ).toBe(false);
  });

  it("returns false instead of throwing when secrets have different byte lengths", () => {
    expect(
      verifyWhatsAppWebhookSecret({
        expectedSecret: "secret",
        receivedSecret: "secreté",
      }),
    ).toBe(false);
  });
});
