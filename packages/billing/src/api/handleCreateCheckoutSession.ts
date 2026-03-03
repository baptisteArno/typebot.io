import { ORPCError } from "@orpc/server";
import { env } from "@typebot.io/env";
import prisma from "@typebot.io/prisma";
import { Plan } from "@typebot.io/prisma/enum";
import type { User } from "@typebot.io/user/schemas";
import { isAdminWriteWorkspaceForbidden } from "@typebot.io/workspaces/isAdminWriteWorkspaceForbidden";
import Stripe from "stripe";
import { z } from "zod";
import { createCheckoutSessionUrl } from "../helpers/createCheckoutSessionUrl";

export const createCheckoutSessionInputSchema = z.object({
  workspaceId: z.string(),
  plan: z.enum([Plan.STARTER, Plan.PRO]),
  returnUrl: z.string(),
});

export const handleCreateCheckoutSession = async ({
  input,
  context: { user },
}: {
  input: z.infer<typeof createCheckoutSessionInputSchema>;
  context: { user: Pick<User, "email" | "id"> };
}) => {
  const { workspaceId, returnUrl, plan } = input;

  if (!env.STRIPE_SECRET_KEY)
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
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
          role: true,
        },
      },
    },
  });

  if (!workspace || isAdminWriteWorkspaceForbidden(workspace, user))
    throw new ORPCError("NOT_FOUND", {
      message: "Workspace not found",
    });
  if (workspace.stripeId)
    throw new ORPCError("BAD_REQUEST", {
      message: "Customer already exists, use updateSubscription endpoint.",
    });

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-09-30.acacia",
  });

  const checkoutUrl = await createCheckoutSessionUrl(stripe)({
    email: user.email,
    userId: user.id,
    workspaceId,
    plan,
    returnUrl,
  });

  if (!checkoutUrl)
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Stripe checkout session creation failed",
    });

  return {
    checkoutUrl,
  };
};
