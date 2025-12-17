import { ORPCError } from "@orpc/server";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import { getSession } from "@typebot.io/chat-session/queries/getSession";
import { env } from "@typebot.io/env";
import { parseGroups } from "@typebot.io/groups/helpers/parseGroups";
import { byId } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import type { Prisma } from "@typebot.io/prisma/types";
import { isTypebotVersionAtLeastV6 } from "@typebot.io/schemas/helpers/isTypebotVersionAtLeastV6";
import { isReadTypebotForbidden } from "@typebot.io/typebot/helpers/isReadTypebotForbidden";
import { resumeWhatsAppFlow } from "@typebot.io/whatsapp/resumeWhatsAppFlow";
import { z } from "@typebot.io/zod";

export const executeTestWebhookWhatsAppInputSchema = z.object({
  typebotId: z.string(),
  blockId: z.string(),
  phone: z.string(),
  body: z.unknown(),
});

type Context = {
  user: Prisma.User;
};

export const handleExecuteTestWebhookWhatsApp = async ({
  input: { typebotId, blockId, phone, body },
  context: { user },
}: {
  input: z.infer<typeof executeTestWebhookWhatsAppInputSchema>;
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

  const chatSession = await getSession(`wa-preview-${phone}`);

  if (!chatSession?.state?.whatsApp)
    throw new ORPCError("BAD_REQUEST", {
      message: "Expected whatsapp chat session",
    });

  await resumeWhatsAppFlow({
    receivedMessages: [
      {
        from: chatSession.id.split("-").at(-1)!,
        timestamp: new Date().toISOString(),
        type: "webhook",
        webhook: {
          data:
            typeof body === "string"
              ? JSON.stringify({ data: JSON.parse(body) })
              : JSON.stringify({ data: body }, null, 2),
        },
      },
    ],
    sessionId: chatSession.id,
    callFrom: "webhook",
  });

  return { message: "OK" };
};
