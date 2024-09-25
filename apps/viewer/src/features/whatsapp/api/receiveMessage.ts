import { publicProcedure } from "@/helpers/server/trpc";
import { isNotDefined } from "@typebot.io/lib/utils";
import { resumeWhatsAppFlow } from "@typebot.io/whatsapp/resumeWhatsAppFlow";
import { whatsAppWebhookRequestBodySchema } from "@typebot.io/whatsapp/schemas";
import { z } from "@typebot.io/zod";

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
    const receivedMessage = entry.at(0)?.changes.at(0)?.value.messages?.at(0);
    if (isNotDefined(receivedMessage)) return { message: "No message found" };
    const contactName =
      entry.at(0)?.changes.at(0)?.value?.contacts?.at(0)?.profile?.name ?? "";
    const contactPhoneNumber =
      entry.at(0)?.changes.at(0)?.value?.messages?.at(0)?.from ?? "";
    const phoneNumberId = entry.at(0)?.changes.at(0)?.value
      .metadata.phone_number_id;
    if (!phoneNumberId) return { message: "No phone number id found" };
    return resumeWhatsAppFlow({
      receivedMessage,
      sessionId: `wa-${phoneNumberId}-${receivedMessage.from}`,
      phoneNumberId,
      credentialsId,
      workspaceId,
      contact: {
        name: contactName,
        phoneNumber: contactPhoneNumber,
      },
    });
  });
