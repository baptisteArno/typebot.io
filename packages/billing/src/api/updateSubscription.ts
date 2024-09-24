import { TRPCError } from "@trpc/server";
import { env } from "@typebot.io/env";
import prisma from "@typebot.io/prisma";
import { Plan } from "@typebot.io/prisma/enum";
import type { User } from "@typebot.io/schemas/features/user/schema";
import { trackEvents } from "@typebot.io/telemetry/trackEvents";
import { isAdminWriteWorkspaceForbidden } from "@typebot.io/workspaces/isAdminWriteWorkspaceForbidden";
import Stripe from "stripe";
import { createCheckoutSessionUrl } from "../helpers/createCheckoutSessionUrl";

type Props = {
  workspaceId: string;
  user: Pick<User, "email" | "id">;
  plan: "STARTER" | "PRO";
  returnUrl: string;
  currency: "usd" | "eur";
};

export const updateSubscription = async ({
  workspaceId,
  user,
  plan,
  returnUrl,
  currency,
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
    apiVersion: "2022-11-15",
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

    await stripe.subscriptions.update(subscription.id, {
      items,
      proration_behavior: "always_invoice",
      metadata: {
        reason: "explicit update",
      },
    });
  } else {
    const checkoutUrl = await createCheckoutSessionUrl(stripe)({
      customerId: workspace.stripeId,
      userId: user.id,
      workspaceId,
      currency,
      plan,
      returnUrl,
    });

    return { checkoutUrl };
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
        plan,
      },
    },
  ]);

  return { workspace: updatedWorkspace };
};
