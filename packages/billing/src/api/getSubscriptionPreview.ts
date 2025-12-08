import { TRPCError } from "@trpc/server";
import { env } from "@typebot.io/env";
import prisma from "@typebot.io/prisma";
import { Plan } from "@typebot.io/prisma/enum";
import type { User } from "@typebot.io/user/schemas";
import { isAdminWriteWorkspaceForbidden } from "@typebot.io/workspaces/isAdminWriteWorkspaceForbidden";
import Stripe from "stripe";

type Props = {
  workspaceId: string;
  user: Pick<User, "email" | "id">;
  plan: "STARTER" | "PRO";
};

export const getSubscriptionPreview = async ({
  workspaceId,
  user,
  plan,
}: Props) => {
  if (!env.STRIPE_SECRET_KEY)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Stripe environment variables are missing",
    });
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
    },
    select: {
      isPastDue: true,
      stripeId: true,
      plan: true,
      members: {
        select: {
          userId: true,
          role: true,
        },
      },
    },
  });
  if (workspace?.isPastDue)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "You have unpaid invoices. Please head over your billing portal to pay it.",
    });
  if (!workspace?.stripeId || isAdminWriteWorkspaceForbidden(workspace, user))
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Workspace not found",
    });

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-09-30.acacia",
  });
  const { data } = await stripe.subscriptions.list({
    customer: workspace.stripeId,
    limit: 1,
    status: "active",
  });
  const subscription = data[0] as Stripe.Subscription | undefined;

  if (!subscription) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No active subscription found",
    });
  }

  const currentPlanItemId = subscription.items.data.find((item) =>
    [env.STRIPE_STARTER_PRICE_ID, env.STRIPE_PRO_PRICE_ID].includes(
      item.price.id,
    ),
  )?.id;
  const currentUsageItemId = subscription.items.data.find(
    (item) =>
      item.price.id === env.STRIPE_STARTER_CHATS_PRICE_ID ||
      item.price.id === env.STRIPE_PRO_CHATS_PRICE_ID,
  )?.id;

  const items = [
    {
      id: currentPlanItemId,
      price:
        plan === Plan.STARTER
          ? env.STRIPE_STARTER_PRICE_ID
          : env.STRIPE_PRO_PRICE_ID,
      quantity: 1,
    },
    {
      id: currentUsageItemId,
      price:
        plan === Plan.STARTER
          ? env.STRIPE_STARTER_CHATS_PRICE_ID
          : env.STRIPE_PRO_CHATS_PRICE_ID,
    },
  ];

  const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
    customer: workspace.stripeId,
    subscription: subscription.id,
    subscription_items: items,
    subscription_proration_behavior: "always_invoice",
  });

  return {
    amountDue: upcomingInvoice.amount_due,
    currency: upcomingInvoice.currency as "usd" | "eur",
  };
};
