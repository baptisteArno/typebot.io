import { ORPCError } from "@orpc/server";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import { env } from "@typebot.io/env";
import { parseGroups } from "@typebot.io/groups/helpers/parseGroups";
import { byId } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import type { Prisma } from "@typebot.io/prisma/types";
import { isTypebotVersionAtLeastV6 } from "@typebot.io/schemas/helpers/isTypebotVersionAtLeastV6";
import { isReadTypebotForbidden } from "@typebot.io/typebot/helpers/isReadTypebotForbidden";
import { z } from "@typebot.io/zod";
import PartySocket from "partysocket";

export const executeTestWebhookInputSchema = z.object({
  typebotId: z.string(),
  blockId: z.string(),
  body: z.unknown(),
});

type Context = {
  user: Prisma.User;
};

export const handleExecuteTestWebhook = async ({
  input: { typebotId, blockId, body },
  context: { user },
}: {
  input: z.infer<typeof executeTestWebhookInputSchema>;
  context: Context;
}) => {
  if (!env.NEXT_PUBLIC_PARTYKIT_HOST)
    throw new ORPCError("NOT_FOUND", {
      message: "PartyKit not configured",
    });

  const typebot = await prisma.typebot.findUnique({
    where: { id: typebotId },
    select: {
      version: true,
      groups: true,
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
      collaborators: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!typebot || (await isReadTypebotForbidden(typebot, user)))
    throw new ORPCError("NOT_FOUND", {
      message: "Typebot not found",
    });

  if (!isTypebotVersionAtLeastV6(typebot.version))
    throw new ORPCError("BAD_REQUEST", {
      message: "Typebot version not supported",
    });

  const block = parseGroups(typebot.groups, {
    typebotVersion: typebot.version,
  })
    .flatMap((g) => g.blocks)
    .find(byId(blockId));

  if (!block || block.type !== LogicBlockType.WEBHOOK)
    throw new ORPCError("NOT_FOUND", {
      message: "Webhook block not found",
    });

  try {
    await PartySocket.fetch(
      {
        host: env.NEXT_PUBLIC_PARTYKIT_HOST,
        room: `${user.id}/${typebotId}/webhooks`,
      },
      {
        method: "POST",
        body: parseBody(body),
      },
    );
  } catch (error) {
    console.error("PartySocket.fetch error:", error);
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "PartySocket.fetch error",
    });
  }

  return { message: "OK" };
};

const parseBody = (body: unknown): string | undefined => {
  if (!body) return;
  return typeof body === "string" ? body : JSON.stringify(body, null, 2);
};
