import { TRPCError } from "@trpc/server";
import { env } from "@typebot.io/env";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/schemas/features/user/schema";
import { isAdminWriteWorkspaceForbidden } from "@typebot.io/workspaces/isAdminWriteWorkspaceForbidden";
import Stripe from "stripe";
import { createCheckoutSessionUrl } from "../helpers/createCheckoutSessionUrl";

type Props = {
  workspaceId: string;
  user: Pick<User, "email" | "id">;
  returnUrl: string;
  plan: "STARTER" | "PRO";
  currency: "usd" | "eur";
};

export const createCheckoutSession = async ({
  workspaceId,
  user,
  returnUrl,
  plan,
  currency,
}: Props) => {
  if (!env.STRIPE_SECRET_KEY)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Stripe environment variables are missing",
    });

  if (!user.email)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "User email is missing",
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
          role: true,
        },
      },
    },
  });

  if (!workspace || isAdminWriteWorkspaceForbidden(workspace, user))
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Workspace not found",
    });
  if (workspace.stripeId)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Customer already exists, use updateSubscription endpoint.",
    });

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-09-30.acacia",
  });

  const checkoutUrl = await createCheckoutSessionUrl(stripe)({
    email: user.email,
    workspaceId,
    currency,
    plan,
    returnUrl,
  });

  if (!checkoutUrl)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Stripe checkout session creation failed",
    });

  return {
    checkoutUrl,
  };
};
