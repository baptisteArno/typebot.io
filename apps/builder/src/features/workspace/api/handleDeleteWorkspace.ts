import { ORPCError } from "@orpc/server";
import { env } from "@typebot.io/env";
import { removeObjectsFromWorkspace } from "@typebot.io/lib/s3/removeObjectsRecursively";
import { isNotEmpty } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import Stripe from "stripe";
import { z } from "zod";
import { isAdminWriteWorkspaceForbidden } from "../helpers/isAdminWriteWorkspaceForbidden";

export const deleteWorkspaceInputSchema = z.object({
  workspaceId: z
    .string()
    .describe(
      "[Where to find my workspace ID?](../how-to#how-to-find-my-workspaceid)",
    ),
});

export const handleDeleteWorkspace = async ({
  input: { workspaceId },
  context: { user },
}: {
  input: z.infer<typeof deleteWorkspaceInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId },
    include: { members: true },
  });

  if (!workspace || isAdminWriteWorkspaceForbidden(workspace, user))
    throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

  await prisma.workspace.deleteMany({
    where: { id: workspaceId },
  });

  if (env.S3_BUCKET) await removeObjectsFromWorkspace(workspaceId);

  if (isNotEmpty(workspace.stripeId) && env.STRIPE_SECRET_KEY) {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-09-30.acacia",
    });

    const subscriptions = await stripe.subscriptions.list({
      customer: workspace.stripeId,
    });

    for (const subscription of subscriptions.data) {
      await stripe.subscriptions.cancel(subscription.id);
    }
  }

  return {
    message: "Workspace deleted",
  };
};
