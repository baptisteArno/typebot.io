import { getSubscriptionToken } from "@inngest/realtime";
import { TRPCError } from "@trpc/server";
import { env } from "@typebot.io/env";
import { inngest } from "@typebot.io/inngest/client";
import {
  EXPORT_REQUESTED_EVENT_NAME,
  type exportResultsEventDataSchema,
} from "@typebot.io/inngest/functions/exportResults";
import prisma from "@typebot.io/prisma";
import { isReadTypebotForbidden } from "@typebot.io/typebot/helpers/isReadTypebotForbidden";
import { z } from "@typebot.io/zod";
import { authenticatedProcedure } from "@/helpers/server/trpc";

export const triggerExportJob = authenticatedProcedure
  .input(
    z.object({
      typebotId: z.string(),
    }),
  )
  .output(
    z.discriminatedUnion("status", [
      z.object({
        status: z.literal("success"),
        eventId: z.string(),
        token: z.any(),
      }),
      z.object({
        status: z.literal("disabled"),
      }),
    ]),
  )
  .mutation(async ({ input: { typebotId }, ctx: { user } }) => {
    if (!env.INNGEST_EVENT_KEY && env.NODE_ENV !== "development")
      return { status: "disabled" };
    const typebot = await prisma.typebot.findUnique({
      where: {
        id: typebotId,
      },
      select: {
        id: true,
        name: true,
        groups: true,
        collaborators: {
          select: {
            userId: true,
            type: true,
          },
        },
        workspace: {
          select: {
            isSuspended: true,
            isPastDue: true,
            members: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });
    if (!typebot || (await isReadTypebotForbidden(typebot, user)))
      throw new TRPCError({ code: "NOT_FOUND", message: "Typebot not found" });

    const token = await getSubscriptionToken(inngest, {
      channel: `user:${user.id}`,
      topics: ["jobStatus"],
    });

    const event = await inngest.send({
      name: EXPORT_REQUESTED_EVENT_NAME,
      data: {
        userId: user.id,
        typebotId,
      } satisfies z.infer<typeof exportResultsEventDataSchema>,
    });

    return { status: "success", eventId: event.ids[0], token };
  });
