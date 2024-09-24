import { TRPCError } from "@trpc/server";
import { env } from "@typebot.io/env";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/schemas/features/user/schema";
import { isAdminWriteWorkspaceForbidden } from "@typebot.io/workspaces/isAdminWriteWorkspaceForbidden";
import Stripe from "stripe";

type Props = {
  workspaceId: string;
  user: Pick<User, "email" | "id">;
};
export const getBillingPortalUrl = async ({ workspaceId, user }: Props) => {
  if (!env.STRIPE_SECRET_KEY)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
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
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Workspace not found",
    });
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2022-11-15",
  });
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: workspace.stripeId,
    return_url: `${env.NEXTAUTH_URL}/typebots`,
  });
  return {
    billingPortalUrl: portalSession.url,
  };
};
