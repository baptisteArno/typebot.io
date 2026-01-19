import { ORPCError } from "@orpc/server";
import { env } from "@typebot.io/env";
import { isDefined } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { isAdminWriteWorkspaceForbidden } from "@typebot.io/workspaces/isAdminWriteWorkspaceForbidden";
import { Stripe } from "stripe";
import { z } from "zod";

export const listInvoicesInputSchema = z.object({
  workspaceId: z
    .string()
    .describe(
      "[Where to find my workspace ID?](../how-to#how-to-find-my-workspaceid)",
    ),
});

export const handleListInvoices = async ({
  input,
  context: { user },
}: {
  input: z.infer<typeof listInvoicesInputSchema>;
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
  const invoices = await stripe.invoices.list({
    customer: workspace.stripeId,
    limit: 50,
  });
  return {
    invoices: invoices.data
      .filter(
        (invoice) => isDefined(invoice.invoice_pdf) && isDefined(invoice.id),
      )
      .map((invoice) => ({
        id: invoice.number as string,
        url: invoice.invoice_pdf as string,
        amount: invoice.subtotal,
        currency: invoice.currency,
        date: invoice.status_transitions.paid_at,
      })),
  };
};
