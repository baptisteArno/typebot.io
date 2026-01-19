import { ORPCError } from "@orpc/server";
import { env } from "@typebot.io/env";
import prisma from "@typebot.io/prisma";
import { Plan, WorkspaceRole } from "@typebot.io/prisma/enum";
import type { Settings } from "@typebot.io/settings/schemas";
import { trackEvents } from "@typebot.io/telemetry/trackEvents";
import { Stripe } from "stripe";
import { z } from "zod";
import { prices } from "../constants";

export const stripeWebhookInputSchema = z.object({
  body: z.string(),
  headers: z.object({
    "stripe-signature": z.string(),
  }),
});

export const handleStripeWebhook = async ({
  input: { body, headers },
}: {
  input: z.infer<typeof stripeWebhookInputSchema>;
}) => {
  if (!env.STRIPE_WEBHOOK_SECRET)
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "STRIPE_WEBHOOK_SECRET is missing",
    });

  const sig = headers["stripe-signature"];

  if (!sig)
    throw new ORPCError("BAD_REQUEST", {
      message: "stripe-signature is missing",
    });

  if (!env.STRIPE_SECRET_KEY)
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "STRIPE_SECRET_KEY is missing",
    });
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-09-30.acacia",
  });

  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    env.STRIPE_WEBHOOK_SECRET,
  );

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata as unknown as
        | {
            plan: "STARTER" | "PRO";
            workspaceId: string;
            userId: string;
          }
        | { claimableCustomPlanId: string; userId: string };
      if ("plan" in metadata) {
        const { workspaceId, plan } = metadata;
        if (!workspaceId || !plan)
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Couldn't retrieve valid metadata",
          });

        const workspace = await prisma.workspace.update({
          where: { id: workspaceId },
          data: {
            plan,
            stripeId: session.customer as string,
            isQuarantined: false,
          },
          include: {
            members: {
              select: { userId: true },
              where: {
                role: WorkspaceRole.ADMIN,
              },
            },
          },
        });

        await trackEvents(
          workspace.members.map((m) => ({
            name: "Subscription updated",
            workspaceId,
            userId: m.userId,
            data: {
              prevPlan: Plan.FREE,
              plan,
            },
          })),
        );
      } else {
        const { claimableCustomPlanId, userId } = metadata;
        if (!claimableCustomPlanId)
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Couldn't retrieve valid metadata",
          });
        const { workspaceId, chatsLimit, seatsLimit, storageLimit } =
          await prisma.claimableCustomPlan.update({
            where: { id: claimableCustomPlanId },
            data: { claimedAt: new Date() },
          });

        await prisma.workspace.updateMany({
          where: { id: workspaceId },
          data: {
            plan: Plan.CUSTOM,
            stripeId: session.customer as string,
            customChatsLimit: chatsLimit,
            customStorageLimit: storageLimit,
            customSeatsLimit: seatsLimit,
          },
        });

        await trackEvents([
          {
            name: "Subscription updated",
            workspaceId,
            userId,
            data: {
              prevPlan: Plan.FREE,
              plan: Plan.CUSTOM,
            },
          },
        ]);
      }

      return { message: "workspace upgraded in DB" };
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const previous = event.data.previous_attributes;

      if (previous?.status === "incomplete")
        return {
          message: "Subscription just created, skipping.",
        };

      const existingWorkspace = await prisma.workspace.findFirst({
        where: {
          stripeId: subscription.customer as string,
        },
        select: {
          isPastDue: true,
          isQuarantined: true,
          id: true,
          plan: true,
          members: {
            select: { userId: true, role: true },
            where: { role: WorkspaceRole.ADMIN },
          },
        },
      });
      if (!existingWorkspace) throw new Error("Workspace not found");

      if (
        subscription.cancel_at_period_end &&
        previous?.cancel_at_period_end === false
      )
        await trackEvents(
          existingWorkspace.members.map((m) => ({
            name: "Subscription scheduled for cancellation",
            workspaceId: existingWorkspace.id,
            userId: m.userId,
            data: {
              plan:
                existingWorkspace.plan === Plan.PRO ? Plan.PRO : Plan.STARTER,
            },
          })),
        );
      if (previous?.cancel_at_period_end && !subscription.cancel_at_period_end)
        await trackEvents(
          existingWorkspace.members.map((m) => ({
            name: "Subscription cancellation removed",
            workspaceId: existingWorkspace.id,
            userId: m.userId,
            data: {
              plan:
                existingWorkspace.plan === Plan.PRO ? Plan.PRO : Plan.STARTER,
            },
          })),
        );

      if (
        subscription.status === "past_due" &&
        previous &&
        previous.status !== "past_due"
      ) {
        await prisma.workspace.updateMany({
          where: {
            id: existingWorkspace.id,
          },
          data: {
            isPastDue: true,
          },
        });

        await trackEvents(
          existingWorkspace.members.map((m) => ({
            name: "Workspace past due",
            workspaceId: existingWorkspace.id,
            userId: m.userId,
          })),
        );
        return { message: "Workspace set to past due." };
      }

      if (
        subscription.status === "unpaid" &&
        previous &&
        previous.status !== "unpaid"
      ) {
        if (!subscription.cancel_at_period_end)
          await stripe.subscriptions.update(subscription.id, {
            cancel_at_period_end: true,
          });
        await prisma.workspace.updateMany({
          where: {
            id: existingWorkspace.id,
          },
          data: {
            isQuarantined: true,
          },
        });

        await trackEvents(
          existingWorkspace.members.flatMap((m) => [
            {
              name: "Workspace unpaid",
              workspaceId: existingWorkspace.id,
              userId: m.userId,
            },
            {
              name: "Workspace automatically quarantined",
              workspaceId: existingWorkspace.id,
              userId: m.userId,
              data: {
                reason: "subscription past due for too long",
              },
            },
          ]),
        );

        return { message: "Workspace quarantined" };
      }

      if (
        subscription.status === "active" &&
        previous &&
        (previous.status === "past_due" || previous?.status === "unpaid") &&
        existingWorkspace.isPastDue
      ) {
        if (subscription.cancel_at_period_end)
          await stripe.subscriptions.update(subscription.id, {
            cancel_at_period_end: false,
          });

        await prisma.workspace.updateMany({
          where: {
            id: existingWorkspace.id,
          },
          data: {
            isPastDue: false,
            isQuarantined: false,
          },
        });

        await trackEvents(
          existingWorkspace.members.map((m) => ({
            name: "Workspace past due status removed",
            workspaceId: existingWorkspace.id,
            userId: m.userId,
          })),
        );
        return { message: "Workspace past due status removed." };
      }

      return { message: "Nothing to do" };
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const { data } = await stripe.subscriptions.list({
        customer: subscription.customer as string,
        limit: 1,
        status: "active",
      });
      const existingSubscription = data[0] as Stripe.Subscription | undefined;
      if (existingSubscription)
        return {
          message: "An active subscription still exists. Skipping downgrade.",
        };
      const outstandingInvoices = await stripe.invoices.list({
        customer: subscription.customer as string,
        status: "open",
      });
      const outstandingInvoicesWithAdditionalUsageCosts =
        outstandingInvoices.data.filter(
          (invoice) => invoice.amount_due > prices["PRO"] * 100,
        );

      const existingWorkspace = await prisma.workspace.findFirst({
        where: {
          stripeId: subscription.customer as string,
        },
        select: {
          plan: true,
        },
      });

      if (!existingWorkspace)
        return { message: "Workspace not found, skipping..." };

      const workspace = await prisma.workspace.update({
        where: {
          stripeId: subscription.customer as string,
        },
        data: {
          plan: Plan.FREE,
          customChatsLimit: null,
          customStorageLimit: null,
          customSeatsLimit: null,
          isPastDue: outstandingInvoicesWithAdditionalUsageCosts.length > 0,
        },
        include: {
          members: {
            select: { userId: true },
            where: {
              role: WorkspaceRole.ADMIN,
            },
          },
        },
      });

      await trackEvents(
        workspace.members.map((m) => ({
          name: "Subscription updated",
          workspaceId: workspace.id,
          userId: m.userId,
          data: {
            prevPlan: existingWorkspace.plan,
            plan: Plan.FREE,
          },
        })),
      );

      const typebots = await prisma.typebot.findMany({
        where: {
          workspaceId: workspace.id,
          isArchived: { not: true },
        },
        include: { publishedTypebot: true },
      });
      for (const typebot of typebots) {
        const settings = typebot.settings as Settings;
        if (settings.general?.isBrandingEnabled) continue;
        await prisma.typebot.updateMany({
          where: { id: typebot.id },
          data: {
            settings: {
              ...settings,
              general: {
                ...settings.general,
                isBrandingEnabled: true,
              },
              whatsApp: settings.whatsApp
                ? {
                    ...settings.whatsApp,
                    isEnabled: false,
                  }
                : undefined,
            },
          },
        });
        const publishedTypebotSettings = typebot.publishedTypebot
          ?.settings as Settings | null;
        if (
          !publishedTypebotSettings ||
          publishedTypebotSettings?.general?.isBrandingEnabled
        )
          continue;
        await prisma.publicTypebot.updateMany({
          where: { id: typebot.id },
          data: {
            settings: {
              updatedAt: new Date(),
              ...publishedTypebotSettings,
              general: {
                ...publishedTypebotSettings.general,
                isBrandingEnabled: true,
              },
            },
          },
        });
      }
      return { message: "workspace downgraded in DB" };
    }
    default: {
      return { message: "Event not handled" };
    }
  }
};
