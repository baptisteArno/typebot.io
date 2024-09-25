import { publicProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import { env } from "@typebot.io/env";
import { isNotDefined } from "@typebot.io/lib/utils";
import { resumeWhatsAppFlow } from "@typebot.io/whatsapp/resumeWhatsAppFlow";
import { whatsAppWebhookRequestBodySchema } from "@typebot.io/whatsapp/schemas";
import { z } from "@typebot.io/zod";

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
    if (!env.WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID is not defined",
      });
    const receivedMessage = entry.at(0)?.changes.at(0)?.value.messages?.at(0);
    if (isNotDefined(receivedMessage)) return { message: "No message found" };
    const contactName =
      entry.at(0)?.changes.at(0)?.value?.contacts?.at(0)?.profile?.name ?? "";
    const contactPhoneNumber =
      entry.at(0)?.changes.at(0)?.value?.messages?.at(0)?.from ?? "";
    return resumeWhatsAppFlow({
      receivedMessage,
      sessionId: `wa-preview-${receivedMessage.from}`,
      contact: {
        name: contactName,
        phoneNumber: contactPhoneNumber,
      },
    });
  });
