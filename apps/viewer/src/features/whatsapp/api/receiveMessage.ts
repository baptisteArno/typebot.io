import { publicProcedure } from "@/helpers/server/trpc";
import * as Sentry from "@sentry/nextjs";
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
    const { receivedMessage, contactName, contactPhoneNumber, phoneNumberId } =
      extractMessageDetails(entry);
    if (!receivedMessage) return { message: "No message found" };
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
      });
    } catch (err) {
      if (err instanceof WhatsAppError) {
        console.log("Known WhatsApp error:", err.message, err.details);
        Sentry.captureMessage(err.message, err.details);
      } else {
        console.error("Unknown WhatsApp error:", err);
        Sentry.captureException(err);
      }
    }

    await Sentry.flush();

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
    .metadata.phone_number_id;
  return { receivedMessage, contactName, contactPhoneNumber, phoneNumberId };
};
