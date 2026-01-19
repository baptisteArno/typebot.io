import {
  authenticatedProcedure,
  publicProcedure as builderPublicProcedure,
} from "@typebot.io/config/orpc/builder/middlewares";
import { publicProcedure as chatPublicProcedure } from "@typebot.io/config/orpc/viewer/middlewares";
import { z } from "zod";
import { WEBHOOK_SUCCESS_MESSAGE } from "../constants";
import { whatsAppWebhookRequestBodySchema } from "../schemas";
import { handleGenerateVerificationToken } from "./handleGenerateVerificationToken";
import {
  getPhoneNumberInputSchema,
  handleGetPhoneNumber,
} from "./handleGetPhoneNumber";
import {
  getSystemTokenInfoInputSchema,
  handleGetSystemTokenInfo,
} from "./handleGetSystemTokenInfo";
import {
  getWhatsAppMediaInputSchema,
  handleGetWhatsAppMedia,
} from "./handleGetWhatsAppMedia";
import {
  getWhatsAppMediaPreviewInputSchema,
  handleGetWhatsAppMediaPreview,
} from "./handleGetWhatsAppMediaPreview";
import { handlePreviewWebhookRequest } from "./handlePreviewWebhookRequest";
import { handleProductionWebhookRequest } from "./handleProductionWebhookRequest";
import {
  handleStartWhatsAppPreview,
  startWhatsAppPreviewInputSchema,
} from "./handleStartWhatsAppPreview";
import {
  handleSubscribePreviewWebhook,
  subscribePreviewWebhookInputSchema,
} from "./handleSubscribePreviewWebhook";
import {
  handleVerifyIfPhoneNumberAvailable,
  verifyIfPhoneNumberAvailableInputSchema,
} from "./handleVerifyIfPhoneNumberAvailable";
import {
  handleWebhookSubscriptionRequest,
  webhookSubscriptionInputSchema,
} from "./handleWebhookSubscriptionRequest";

export const chatWhatsAppRouter = {
  subscribeWebhookProcedure: chatPublicProcedure
    .route({
      method: "GET",
      path: "/v1/workspaces/{workspaceId}/whatsapp/{credentialsId}/webhook",
      summary: "Subscribe webhook",
      tags: ["WhatsApp"],
    })
    .input(webhookSubscriptionInputSchema)
    .output(z.number())
    .handler(handleWebhookSubscriptionRequest),
  productionWebhookProcedure: chatPublicProcedure
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
  previewWebhookProcedure: builderPublicProcedure
    .route({
      method: "POST",
      path: "/v1/whatsapp/preview/webhook",
      tags: ["WhatsApp"],
    })
    .input(whatsAppWebhookRequestBodySchema)
    .output(z.literal(WEBHOOK_SUCCESS_MESSAGE))
    .handler(handlePreviewWebhookRequest),
  startWhatsAppPreview: authenticatedProcedure
    .route({
      method: "POST",
      path: "/v1/typebots/{typebotId}/whatsapp/start-preview",
      summary: "Start preview",
      tags: ["WhatsApp"],
    })
    .input(startWhatsAppPreviewInputSchema)
    .output(
      z.object({
        message: z.string(),
      }),
    )
    .handler(handleStartWhatsAppPreview),

  subscribePreviewWebhook: builderPublicProcedure
    .route({
      method: "GET",
      path: "/v1/whatsapp/preview/webhook",
      summary: "Subscribe webhook",
      tags: ["WhatsApp"],
    })
    .input(subscribePreviewWebhookInputSchema)
    .output(z.number())
    .handler(handleSubscribePreviewWebhook),

  getPhoneNumber: authenticatedProcedure
    .input(getPhoneNumberInputSchema)
    .handler(handleGetPhoneNumber),

  getSystemTokenInfo: authenticatedProcedure
    .input(getSystemTokenInfoInputSchema)
    .handler(handleGetSystemTokenInfo),

  verifyIfPhoneNumberAvailable: authenticatedProcedure
    .input(verifyIfPhoneNumberAvailableInputSchema)
    .handler(handleVerifyIfPhoneNumberAvailable),

  generateVerificationToken: authenticatedProcedure.handler(
    handleGenerateVerificationToken,
  ),

  getWhatsAppMedia: authenticatedProcedure
    .route({
      method: "GET",
      path: "/typebots/{typebotId}/whatsapp/media/{mediaId}",
      outputStructure: "detailed",
    })
    .input(getWhatsAppMediaInputSchema)
    .output(
      z.object({
        headers: z.object({
          "content-type": z.string(),
          "cache-control": z.string(),
        }),
        body: z.instanceof(Blob),
      }),
    )
    .handler(handleGetWhatsAppMedia),

  getWhatsAppMediaPreview: authenticatedProcedure
    .route({
      method: "GET",
      path: "/typebots/{typebotId}/whatsapp/media/preview/{mediaId}",
      outputStructure: "detailed",
    })
    .input(getWhatsAppMediaPreviewInputSchema)
    .output(
      z.object({
        headers: z.object({
          "content-type": z.string(),
          "cache-control": z.string(),
        }),
        body: z.instanceof(Blob),
      }),
    )
    .handler(handleGetWhatsAppMediaPreview),
};
