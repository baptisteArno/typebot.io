import { getSubscriptionToken } from "@inngest/realtime";
import { ORPCError } from "@orpc/server";
import { env } from "@typebot.io/env";
import { inngest } from "@typebot.io/inngest/client";
import {
  EXPORT_REQUESTED_EVENT_NAME,
  type exportResultsEventDataSchema,
} from "@typebot.io/inngest/functions/exportResults";
import prisma from "@typebot.io/prisma";
import { isReadTypebotForbidden } from "@typebot.io/typebot/helpers/isReadTypebotForbidden";
import type { User } from "@typebot.io/user/schemas";
import { z } from "@typebot.io/zod";

export const triggerExportJobInputSchema = z.object({
  typebotId: z.string(),
});

export const handleTriggerExportJob = async ({
  input: { typebotId },
  context: { user },
}: {
  input: z.infer<typeof triggerExportJobInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
  if (!env.INNGEST_EVENT_KEY && env.NODE_ENV !== "development")
    return { status: "disabled" as const };
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
    throw new ORPCError("NOT_FOUND", { message: "Typebot not found" });

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

  return { status: "success" as const, eventId: event.ids[0], token };
};
