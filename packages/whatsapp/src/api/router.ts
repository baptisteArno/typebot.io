import { publicProcedure } from "@typebot.io/config/orpc/viewer/middlewares";
import { z } from "@typebot.io/zod";
import { WEBHOOK_SUCCESS_MESSAGE } from "../constants";
import { whatsAppWebhookRequestBodySchema } from "../schemas";
import { handlePreviewWebhookRequest } from "./handlePreviewWebhookRequest";
import { handleProductionWebhookRequest } from "./handleProductionWebhookRequest";
import {
  handleWebhookSubscriptionRequest,
  webhookSubscriptionInputSchema,
} from "./handleWebhookSubscriptionRequest";

export const chatWhatsAppRouter = {
  subscribeWebhookProcedure: publicProcedure
    .route({
      method: "GET",
      path: "/v1/workspaces/{workspaceId}/whatsapp/{credentialsId}/webhook",
      summary: "Subscribe webhook",
      tags: ["WhatsApp"],
    })
    .input(webhookSubscriptionInputSchema)
    .output(z.number())
    .handler(handleWebhookSubscriptionRequest),
  productionWebhookProcedure: publicProcedure
    .route({
      method: "POST",
      path: "/v1/workspaces/{workspaceId}/whatsapp/{credentialsId}/webhook",
      tags: ["WhatsApp"],
    })
    .input(
      whatsAppWebhookRequestBodySchema.extend({
        workspaceId: z.string(),
        credentialsId: z.string(),
      }),
    )
    .output(z.literal(WEBHOOK_SUCCESS_MESSAGE))
    .handler(handleProductionWebhookRequest),
};

export const builderWhatsAppRouter = {
  previewWebhookProcedure: publicProcedure
    .route({
      method: "POST",
      path: "/v1/whatsapp/preview/webhook",
      tags: ["WhatsApp"],
    })
    .input(whatsAppWebhookRequestBodySchema)
    .output(z.literal(WEBHOOK_SUCCESS_MESSAGE))
    .handler(handlePreviewWebhookRequest),
};
