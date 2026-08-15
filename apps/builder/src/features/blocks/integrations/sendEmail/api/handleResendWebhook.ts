import { ORPCError } from "@orpc/server";
import { getEmailDomain } from "@typebot.io/emails/helpers/getEmailDomain";
import { guestInvitationEmailSubject } from "@typebot.io/emails/helpers/guestInvitationEmailSubject";
import { runRecordTransientGeneralBounces } from "@typebot.io/emails/helpers/suppressedEmails";
import { env } from "@typebot.io/env";
import { logGuestInvitationEvent } from "@typebot.io/telemetry/logGuestInvitationEvent";
import { Webhook } from "svix";
import { z } from "zod";

export const resendWebhookInputSchema = z.object({
  body: z.string(),
  headers: z.object({
    "svix-id": z.string(),
    "svix-timestamp": z.string(),
    "svix-signature": z.string(),
  }),
});

const resendBounceSchema = z.object({
  type: z.literal("email.bounced"),
  data: z.object({
    email_id: z.string(),
    subject: z.string(),
    to: z.array(z.email()).min(1),
    bounce: z.object({
      type: z.string(),
      subType: z.string().optional(),
    }),
  }),
});

export const handleResendWebhook = async ({
  input: { body, headers },
}: {
  input: z.infer<typeof resendWebhookInputSchema>;
}) => {
  if (!env.RESEND_WEBHOOK_SECRET)
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "RESEND_WEBHOOK_SECRET is missing",
    });

  const webhook = new Webhook(env.RESEND_WEBHOOK_SECRET);

  let payload: unknown;
  try {
    payload = webhook.verify(body, headers);
  } catch (error) {
    console.error("Resend webhook signature verification failed", error);
    throw new ORPCError("BAD_REQUEST", {
      message: "Invalid webhook signature",
    });
  }

  const parsed = resendBounceSchema.safeParse(payload);
  if (!parsed.success) return { message: "Ignored event" };

  const { email_id, subject, to, bounce } = parsed.data.data;

  if (subject === guestInvitationEmailSubject)
    for (const recipient of to)
      logGuestInvitationEvent({
        bounceSubType: bounce.subType,
        bounceType: bounce.type,
        emailId: email_id,
        name: "bounce",
        recipientDomain: getEmailDomain(recipient),
      });

  if (!isTransientGeneralBounce(bounce.type))
    return { message: "Ignored bounce type" };

  await runRecordTransientGeneralBounces(to, headers["svix-id"]);

  return { message: "Suppression updated" };
};

const isTransientGeneralBounce = (type: string) => {
  const normalizedType = type.toLowerCase();
  return normalizedType === "transient" || normalizedType === "temporary";
};
