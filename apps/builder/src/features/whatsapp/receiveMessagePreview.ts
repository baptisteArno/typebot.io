import { publicProcedure } from "@/helpers/server/trpc";
import * as Sentry from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";
import { deleteSession } from "@typebot.io/bot-engine/queries/deleteSession";
import { env } from "@typebot.io/env";
import { WhatsAppError } from "@typebot.io/whatsapp/WhatsAppError";
import { incomingWebhookErrorCodes } from "@typebot.io/whatsapp/constants";
import { resumeWhatsAppFlow } from "@typebot.io/whatsapp/resumeWhatsAppFlow";
import {
  type WhatsAppWebhookRequestBody,
  whatsAppWebhookRequestBodySchema,
} from "@typebot.io/whatsapp/schemas";
import { z } from "@typebot.io/zod";

const whatsAppPreviewSessionIdPrefix = "wa-preview-";

export const receiveMessagePreview = publicProcedure
  .meta({
    openapi: {
      method: "POST",
      path: "/v1/whatsapp/preview/webhook",
      summary: "Message webhook",
      tags: ["WhatsApp"],
    },
  })
  .input(whatsAppWebhookRequestBodySchema)
  .output(
    z.object({
      message: z.string(),
    }),
  )
  .mutation(async ({ input: { entry } }) => {
    assertEnv();

    try {
      processErrors(entry);
      const { receivedMessage, contactName, contactPhoneNumber } =
        extractMessageData(entry);
      await resumeWhatsAppFlow({
        receivedMessage,
        sessionId: `${whatsAppPreviewSessionIdPrefix}${receivedMessage.from}`,
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

const assertEnv = () => {
  if (!env.WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID is not defined",
    });
};

const extractMessageData = (entry: WhatsAppWebhookRequestBody["entry"]) => {
  const receivedMessage = entry.at(0)?.changes.at(0)?.value.messages?.at(0);
  if (!receivedMessage) throw new WhatsAppError("No message found");
  const contactName =
    entry.at(0)?.changes.at(0)?.value?.contacts?.at(0)?.profile?.name ?? "";
  const contactPhoneNumber =
    entry.at(0)?.changes.at(0)?.value?.messages?.at(0)?.from ?? "";

  return { receivedMessage, contactName, contactPhoneNumber };
};

const processErrors = async (entry: WhatsAppWebhookRequestBody["entry"]) => {
  const status = entry.at(0)?.changes.at(0)?.value.statuses?.at(0);
  if (status?.errors) {
    const error = status.errors.at(0);
    if (!error) return;
    if (
      error?.code ===
      incomingWebhookErrorCodes["Could not send message to unengaged user"]
    ) {
      await deleteSession(
        `${whatsAppPreviewSessionIdPrefix}${status.recipient_id}`,
      );
      throw new WhatsAppError("Could not send message to unengaged user");
    }
    throw new WhatsAppError(`Received unknown error from WA`, error);
  }
};
