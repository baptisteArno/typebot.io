import { TRPCError } from "@trpc/server";
import { env } from "@typebot.io/env";
import prisma from "@typebot.io/prisma";
import type { Prisma } from "@typebot.io/prisma/types";
import type { User } from "@typebot.io/schemas/features/user/schema";
import { isReadWorkspaceFobidden } from "@typebot.io/workspaces/isReadWorkspaceFobidden";
import Stripe from "stripe";
import { subscriptionSchema } from "../schemas/subscription";

type Props = {
  workspaceId: string;
  user: Pick<User, "email" | "id">;
};

export const getSubscription = async ({ workspaceId, user }: Props) => {
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
      stripeId: true,
      members: {
        select: {
          userId: true,
        },
      },
    },
  });
  if (!workspace || isReadWorkspaceFobidden(workspace, user))
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Workspace not found",
    });
  if (!workspace?.stripeId)
    return {
      subscription: null,
    };
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2022-11-15",
  });
  const subscriptions = await stripe.subscriptions.list({
    customer: workspace.stripeId,
  });

  const currentSubscription = subscriptions.data
    .filter((sub) => ["past_due", "active"].includes(sub.status))
    .sort((a, b) => a.created - b.created)
    .shift();

  if (!currentSubscription)
    return {
      subscription: null,
    };

  return {
    subscription: {
      currentBillingPeriod: subscriptionSchema.shape.currentBillingPeriod.parse(
        {
          start: new Date(currentSubscription.current_period_start),
          end: new Date(currentSubscription.current_period_end),
        },
      ),
      status: subscriptionSchema.shape.status.parse(currentSubscription.status),
      currency: currentSubscription.currency as "usd" | "eur",
      cancelDate: currentSubscription.cancel_at
        ? new Date(currentSubscription.cancel_at * 1000)
        : undefined,
    },
  };
};
