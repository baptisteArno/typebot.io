import {
  authenticatedProcedure,
  publicProcedure,
} from "@typebot.io/config/orpc/builder/middlewares";
import { workspaceSchema } from "@typebot.io/workspaces/schemas";
import { z } from "zod";
import { invoiceSchema } from "../schemas/invoice";
import { subscriptionSchema } from "../schemas/subscription";
import {
  createCheckoutSessionInputSchema,
  handleCreateCheckoutSession,
} from "./handleCreateCheckoutSession";
import {
  createCustomCheckoutSessionInputSchema,
  handleCreateCustomCheckoutSession,
} from "./handleCreateCustomCheckoutSession";
import {
  getBillingPortalUrlInputSchema,
  handleGetBillingPortalUrl,
} from "./handleGetBillingPortalUrl";
import {
  getSubscriptionInputSchema,
  handleGetSubscription,
} from "./handleGetSubscription";
import {
  getSubscriptionPreviewInputSchema,
  handleGetSubscriptionPreview,
} from "./handleGetSubscriptionPreview";
import { getUsageInputSchema, handleGetUsage } from "./handleGetUsage";
import {
  handleListInvoices,
  listInvoicesInputSchema,
} from "./handleListInvoices";
import {
  handleStripeWebhook,
  stripeWebhookInputSchema,
} from "./handleStripeWebhook";
import {
  handleUpdateSubscription,
  updateSubscriptionInputSchema,
} from "./handleUpdateSubscription";

export const billingRouter = {
  webhook: publicProcedure
    .route({
      method: "POST",
      path: "/stripe/webhook",
      summary: "Handle webhook",
      tags: ["Billing"],
      inputStructure: "detailed",
    })
    .input(stripeWebhookInputSchema)
    .output(z.object({ message: z.string() }))
    .handler(handleStripeWebhook),

  getUsage: authenticatedProcedure
    .route({
      method: "GET",
      path: "/v1/billing/usage",
      summary: "Get current plan usage",
      tags: ["Billing"],
    })
    .input(getUsageInputSchema)
    .output(z.object({ totalChatsUsed: z.number(), resetsAt: z.date() }))
    .handler(handleGetUsage),

  listInvoices: authenticatedProcedure
    .route({
      method: "GET",
      path: "/v1/billing/invoices",
      summary: "List invoices",
      tags: ["Billing"],
    })
    .input(listInvoicesInputSchema)
    .output(
      z.object({
        invoices: z.array(invoiceSchema),
      }),
    )
    .handler(handleListInvoices),
  createCheckoutSession: authenticatedProcedure
    .input(createCheckoutSessionInputSchema)
    .output(
      z.object({
        checkoutUrl: z.string(),
      }),
    )
    .handler(handleCreateCheckoutSession),

  createCustomCheckoutSession: authenticatedProcedure
    .input(createCustomCheckoutSessionInputSchema)
    .output(
      z.object({
        checkoutUrl: z.string(),
      }),
    )
    .handler(handleCreateCustomCheckoutSession),

  getBillingPortalUrl: authenticatedProcedure
    .input(getBillingPortalUrlInputSchema)
    .output(
      z.object({
        billingPortalUrl: z.string(),
      }),
    )
    .handler(handleGetBillingPortalUrl),

  getSubscription: authenticatedProcedure
    .input(getSubscriptionInputSchema)
    .output(
      z.object({
        subscription: subscriptionSchema.or(z.null()),
      }),
    )
    .handler(handleGetSubscription),

  getSubscriptionPreview: authenticatedProcedure
    .input(getSubscriptionPreviewInputSchema)
    .output(
      z.object({
        amountDue: z.number(),
        currency: z.enum(["usd", "eur"]),
      }),
    )
    .handler(handleGetSubscriptionPreview),

  updateSubscription: authenticatedProcedure
    .input(updateSubscriptionInputSchema)
    .output(
      z.discriminatedUnion("type", [
        z.object({
          type: z.literal("success"),
          workspace: workspaceSchema,
        }),
        z.object({
          type: z.literal("error"),
          title: z.string(),
          description: z.string().nullish(),
        }),
        z.object({
          type: z.literal("checkoutUrl"),
          checkoutUrl: z.string(),
        }),
      ]),
    )
    .handler(handleUpdateSubscription),
};
