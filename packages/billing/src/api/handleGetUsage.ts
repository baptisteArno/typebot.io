import { ORPCError } from "@orpc/server";
import { env } from "@typebot.io/env";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { isReadWorkspaceFobidden } from "@typebot.io/workspaces/isReadWorkspaceFobidden";
import Stripe from "stripe";
import { z } from "zod";

export const getUsageInputSchema = z.object({
  workspaceId: z
    .string()
    .describe(
      "[Where to find my workspace ID?](../how-to#how-to-find-my-workspaceid)",
    ),
});

export const handleGetUsage = async ({
  input,
  context: { user },
}: {
  input: z.infer<typeof getUsageInputSchema>;
  context: { user: Pick<User, "email" | "id"> };
}) => {
  const { workspaceId } = input;

  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
    },
    select: {
      stripeId: true,
      plan: true,
      members: {
        select: {
          userId: true,
        },
      },
      typebots: {
        select: { id: true },
      },
    },
  });
  if (!workspace || isReadWorkspaceFobidden(workspace, user))
    throw new ORPCError("NOT_FOUND", {
      message: "Workspace not found",
    });

  if (
    !env.STRIPE_SECRET_KEY ||
    !workspace.stripeId ||
    (workspace.plan !== "STARTER" && workspace.plan !== "PRO")
  ) {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalChatsUsed = await prisma.result.count({
      where: {
        typebotId: { in: workspace.typebots.map((typebot) => typebot.id) },
        hasStarted: true,
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
    });

    const firstDayOfNextMonth = new Date(
      firstDayOfMonth.getFullYear(),
      firstDayOfMonth.getMonth() + 1,
      1,
    );
    return { totalChatsUsed, resetsAt: firstDayOfNextMonth };
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-09-30.acacia",
  });

  const subscriptions = await stripe.subscriptions.list({
    customer: workspace.stripeId,
  });

  const currentSubscription = subscriptions.data
    .filter((sub) => ["past_due", "active"].includes(sub.status))
    .sort((a, b) => a.created - b.created)
    .shift();

  if (!currentSubscription)
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: `No subscription found on workspace: ${workspaceId}`,
    });

  const totalChatsUsed = await prisma.result.count({
    where: {
      typebotId: { in: workspace.typebots.map((typebot) => typebot.id) },
      hasStarted: true,
      createdAt: {
        gte: new Date(currentSubscription.current_period_start * 1000),
      },
    },
  });

  return {
    totalChatsUsed,
    resetsAt: new Date(currentSubscription.current_period_end * 1000),
  };
};
