import { ORPCError } from "@orpc/server";
import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { env } from "@typebot.io/env";
import { removeObjectsFromWorkspace } from "@typebot.io/lib/s3/removeObjectsRecursively";
import { isNotEmpty } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import Stripe from "stripe";
import { isAdminWriteWorkspaceForbidden } from "../helpers/isAdminWriteWorkspaceForbidden";

export const deleteWorkspace = authenticatedProcedure
  .route({
    method: "DELETE",
    path: "/v1/workspaces/{workspaceId}",
    summary: "Delete workspace",
    tags: ["Workspace"],
  })
  .input(
    z.object({
      workspaceId: z
        .string()
        .describe(
          "[Where to find my workspace ID?](../how-to#how-to-find-my-workspaceid)",
        ),
    }),
  )
  .output(
    z.object({
      message: z.string(),
    }),
  )
  .handler(async ({ input: { workspaceId }, context: { user } }) => {
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
  });
