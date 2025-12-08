import { TRPCError } from "@trpc/server";
import { env } from "@typebot.io/env";
import prisma from "@typebot.io/prisma";
import { Plan } from "@typebot.io/prisma/enum";
import { trackEvents } from "@typebot.io/telemetry/trackEvents";
import type { User } from "@typebot.io/user/schemas";
import { isAdminWriteWorkspaceForbidden } from "@typebot.io/workspaces/isAdminWriteWorkspaceForbidden";
import { workspaceSchema } from "@typebot.io/workspaces/schemas";
import Stripe from "stripe";
import { createCheckoutSessionUrl } from "../helpers/createCheckoutSessionUrl";

type Props = {
  workspaceId: string;
  user: Pick<User, "email" | "id">;
  plan: "STARTER" | "PRO";
  returnUrl: string;
};

export const updateSubscription = async ({
  workspaceId,
  user,
  plan,
  returnUrl,
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
  const currentPlanItemId = subscription?.items.data.find((item) =>
    [env.STRIPE_STARTER_PRICE_ID, env.STRIPE_PRO_PRICE_ID].includes(
      item.price.id,
    ),
  )?.id;
  const currentUsageItemId = subscription?.items.data.find(
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

  if (subscription) {
    if (plan === "STARTER") {
      const totalChatsUsed = await prisma.result.count({
        where: {
          typebot: { workspaceId },
          hasStarted: true,
          createdAt: {
            gte: new Date(subscription.current_period_start * 1000),
          },
        },
      });
      if (totalChatsUsed >= 4000) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "You have collected more than 4000 chats during this billing cycle. You can't downgrade to the Starter.",
        });
      }
    }

    try {
      await stripe.subscriptions.update(subscription.id, {
        items,
        proration_behavior: "always_invoice",
        payment_behavior: "error_if_incomplete",
        metadata: {
          reason: "explicit update",
        },
      });
    } catch {
      return {
        type: "error" as const,
        title: "Payment required",
        description: "Check your payment method and try again.",
      };
    }
  } else {
    const checkoutUrl = await createCheckoutSessionUrl(stripe)({
      customerId: workspace.stripeId,
      userId: user.id,
      workspaceId,
      plan,
      returnUrl,
    });

    if (!checkoutUrl)
      return {
        type: "error" as const,
        title: "Failed to create checkout session",
      };

    return { type: "checkoutUrl" as const, checkoutUrl };
  }

  const updatedWorkspace = await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      plan,
      isQuarantined: false,
    },
  });

  await trackEvents([
    {
      name: "Subscription updated",
      workspaceId,
      userId: user.id,
      data: {
        prevPlan: workspace.plan,
        plan,
      },
    },
  ]);

  return {
    type: "success" as const,
    workspace: workspaceSchema.parse(updatedWorkspace),
  };
};
