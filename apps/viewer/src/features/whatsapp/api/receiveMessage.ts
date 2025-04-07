import { publicProcedure } from "@/helpers/server/trpc";
import * as Sentry from "@sentry/nextjs";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import { WhatsAppError } from "@typebot.io/whatsapp/WhatsAppError";
import { resumeWhatsAppFlow } from "@typebot.io/whatsapp/resumeWhatsAppFlow";
import {
  type WhatsAppWebhookRequestBody,
  whatsAppWebhookRequestBodySchema,
} from "@typebot.io/whatsapp/schemas";
import { z } from "@typebot.io/zod";

const whatsAppSessionIdPrefix = "wa-";

export const receiveMessage = publicProcedure
  .meta({
    openapi: {
      method: "POST",
      path: "/v1/workspaces/{workspaceId}/whatsapp/{credentialsId}/webhook",
      summary: "Message webhook",
      tags: ["WhatsApp"],
    },
  })
  .input(
    z
      .object({ workspaceId: z.string(), credentialsId: z.string() })
      .merge(whatsAppWebhookRequestBodySchema),
  )
  .output(
    z.object({
      message: z.string(),
    }),
  )
  .mutation(async ({ input: { entry, credentialsId, workspaceId } }) => {
    const {
      receivedMessage,
      contactName,
      contactPhoneNumber,
      phoneNumberId,
      referral,
    } = extractMessageDetails(entry);
    if (!receivedMessage || receivedMessage.type === "reaction")
      return { message: "No message content found" };
    if (!phoneNumberId) return { message: "No phone number found" };

    try {
      await resumeWhatsAppFlow({
        receivedMessage,
        sessionId: `${whatsAppSessionIdPrefix}${phoneNumberId}-${receivedMessage.from}`,
        phoneNumberId,
        credentialsId,
        workspaceId,
        contact: {
          name: contactName,
          phoneNumber: contactPhoneNumber,
        },
        referral,
      });
    } catch (err) {
      if (err instanceof WhatsAppError) {
        Sentry.captureMessage(err.message, err.details);
      } else {
        console.log("Sending unknown error to Sentry");
        const details = safeJsonParse(
          (await parseUnknownError({ err })).details,
        );
        console.log("details", details);
        Sentry.addBreadcrumb({
          data:
            typeof details === "object" && details
              ? details
              : {
                  details,
                },
        });
        Sentry.captureException(err);
      }
    }

    return {
      message: "Message received",
    };
  });

const extractMessageDetails = (entry: WhatsAppWebhookRequestBody["entry"]) => {
  const receivedMessage = entry.at(0)?.changes.at(0)?.value.messages?.at(0);
  const contactName =
    entry.at(0)?.changes.at(0)?.value?.contacts?.at(0)?.profile?.name ?? "";
  const contactPhoneNumber =
    entry.at(0)?.changes.at(0)?.value?.messages?.at(0)?.from ?? "";
  const phoneNumberId = entry.at(0)?.changes.at(0)?.value
    .metadata?.phone_number_id;
  const referral = entry.at(0)?.changes.at(0)?.value.messages?.at(0)?.referral;
  return {
    receivedMessage,
    contactName,
    contactPhoneNumber,
    phoneNumberId,
    referral,
  };
};

const safeJsonParse = (value: string | undefined): unknown => {
  if (!value) return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};
