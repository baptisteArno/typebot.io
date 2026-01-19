import { ORPCError } from "@orpc/server";
import { env } from "@typebot.io/env";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { isAdminWriteWorkspaceForbidden } from "@typebot.io/workspaces/isAdminWriteWorkspaceForbidden";
import Stripe from "stripe";
import { z } from "zod";

export const getBillingPortalUrlInputSchema = z.object({
  workspaceId: z.string(),
});

export const handleGetBillingPortalUrl = async ({
  input,
  context: { user },
}: {
  input: z.infer<typeof getBillingPortalUrlInputSchema>;
  context: { user: Pick<User, "email" | "id"> };
}) => {
  const { workspaceId } = input;

  if (!env.STRIPE_SECRET_KEY)
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "STRIPE_SECRET_KEY var is missing",
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
  if (!workspace?.stripeId || isAdminWriteWorkspaceForbidden(workspace, user))
    throw new ORPCError("NOT_FOUND", {
      message: "Workspace not found",
    });
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-09-30.acacia",
  });
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: workspace.stripeId,
    return_url: `${env.NEXTAUTH_URL}/typebots`,
  });
  return {
    billingPortalUrl: portalSession.url,
  };
};
