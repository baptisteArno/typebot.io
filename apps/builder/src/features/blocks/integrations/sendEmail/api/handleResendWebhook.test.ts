import { beforeEach, describe, expect, it, mock } from "bun:test";

const logGuestInvitationEvent = mock();
const runRecordTransientGeneralBounces = mock();
const webhookSecret = `whsec_${Buffer.from("guest-invitation-webhook-secret").toString("base64")}`;

mock.module("@typebot.io/emails/helpers/suppressedEmails", () => ({
  runRecordTransientGeneralBounces,
}));

mock.module("@typebot.io/env", () => ({
  env: { RESEND_WEBHOOK_SECRET: webhookSecret },
}));

mock.module("@typebot.io/telemetry/logGuestInvitationEvent", () => ({
  logGuestInvitationEvent,
}));

const { Webhook } = await import("svix");
const { handleResendWebhook } = await import("./handleResendWebhook");

describe("handleResendWebhook", () => {
  beforeEach(() => {
    logGuestInvitationEvent.mockReset();
    runRecordTransientGeneralBounces.mockReset();
    runRecordTransientGeneralBounces.mockResolvedValue(undefined);
  });

  it("logs guest invitation bounces without recipient addresses", async () => {
    await expect(
      handleResendWebhook(
        createWebhookInput({
          type: "email.bounced",
          data: {
            email_id: "email-id",
            subject: "You've been invited to collaborate",
            to: ["Guest@Example.COM"],
            bounce: { type: "Permanent", subType: "MessageRejected" },
          },
        }),
      ),
    ).resolves.toEqual({ message: "Ignored bounce type" });

    expect(logGuestInvitationEvent).toHaveBeenCalledWith({
      bounceSubType: "MessageRejected",
      bounceType: "Permanent",
      emailId: "email-id",
      name: "bounce",
      recipientDomain: "example.com",
    });
    expect(runRecordTransientGeneralBounces).not.toHaveBeenCalled();
  });

  it("does not classify other email bounces as guest invitations", async () => {
    await expect(
      handleResendWebhook(
        createWebhookInput({
          type: "email.bounced",
          data: {
            email_id: "email-id",
            subject: "Welcome to Typebot!",
            to: ["user@example.com"],
            bounce: { type: "Temporary" },
          },
        }),
      ),
    ).resolves.toEqual({ message: "Suppression updated" });

    expect(logGuestInvitationEvent).not.toHaveBeenCalled();
    expect(runRecordTransientGeneralBounces).toHaveBeenCalledWith(
      ["user@example.com"],
      "webhook-id",
    );
  });
});

const createWebhookInput = (payload: unknown) => {
  const body = JSON.stringify(payload);
  const timestamp = new Date();

  return {
    input: {
      body,
      headers: {
        "svix-id": "webhook-id",
        "svix-signature": new Webhook(webhookSecret).sign(
          "webhook-id",
          timestamp,
          body,
        ),
        "svix-timestamp": Math.floor(timestamp.getTime() / 1000).toString(),
      },
    },
  };
};
