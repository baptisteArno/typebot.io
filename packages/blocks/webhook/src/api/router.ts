import { protectedProcedure } from "@typebot.io/config/orpc/viewer/middlewares";
import { z } from "@typebot.io/zod";
import {
  executeTestWebhookInputSchema,
  handleExecuteTestWebhook,
} from "./handleExecuteTestWebhook";
import {
  executeTestWebhookWhatsAppInputSchema,
  handleExecuteTestWebhookWhatsApp,
} from "./handleExecuteTestWebhookWhatsApp";
import {
  executeWebhookInputSchema,
  handleExecuteWebhook,
} from "./handleExecuteWebhook";

export const privateRouter = {
  executeWebhookProcedure: protectedProcedure
    .route({
      method: "POST",
      path: "/v1/typebots/{typebotId}/blocks/{blockId}/results/{resultId}/executeWebhook",
      summary: "Execute webhook",
      description:
        "Execute a webhook block in a live chat session. Handles both web (PartyKit) and WhatsApp flows.",
      tags: ["Webhook"],
    })
    .input(executeWebhookInputSchema)
    .output(z.object({ message: z.string() }))
    .handler(handleExecuteWebhook),

  executeTestWebhookProcedure: protectedProcedure
    .route({
      method: "POST",
      path: "/v1/typebots/{typebotId}/blocks/{blockId}/web/executeTestWebhook",
      summary: "Execute test webhook (web)",
      description:
        "Test a webhook block execution in web preview mode. Sends data to PartyKit for preview testing.",
      tags: ["Webhook"],
    })
    .input(executeTestWebhookInputSchema)
    .output(z.object({ message: z.string() }))
    .handler(handleExecuteTestWebhook),

  executeTestWebhookWhatsAppProcedure: protectedProcedure
    .route({
      method: "POST",
      path: "/v1/typebots/{typebotId}/blocks/{blockId}/whatsapp/{phone}/executeTestWebhook",
      summary: "Execute test webhook (WhatsApp)",
      description:
        "Test a webhook block execution in WhatsApp preview mode. Resumes the WhatsApp flow with webhook data.",
      tags: ["Webhook"],
    })
    .input(executeTestWebhookWhatsAppInputSchema)
    .output(z.object({ message: z.string() }))
    .handler(handleExecuteTestWebhookWhatsApp),
};
