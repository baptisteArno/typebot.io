import { authenticateUser } from "@/helpers/authenticateUser";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import { getSession } from "@typebot.io/bot-engine/queries/getSession";
import { env } from "@typebot.io/env";
import { parseGroups } from "@typebot.io/groups/schemas";
import {
  forbidden,
  internalServerError,
  methodNotAllowed,
  notFound,
} from "@typebot.io/lib/api/utils";
import { byId } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import { isReadTypebotForbidden } from "@typebot.io/typebot/helpers/isReadTypebotForbidden";
import { resumeWhatsAppFlow } from "@typebot.io/whatsapp/resumeWhatsAppFlow";
import type { NextApiRequest, NextApiResponse } from "next";
import PartySocket from "partysocket";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    if (!env.NEXT_PUBLIC_PARTYKIT_HOST) return notFound(res);
    const user = await authenticateUser(req);
    if (!user) return forbidden(res, "User not authenticated");
    const typebotId = req.query.typebotId as string;
    const blockId = req.query.blockId as string;
    const resultId = req.query.resultId as string;
    const typebot = await prisma.typebot.findUnique({
      where: { id: typebotId },
      select: {
        version: true,
        groups: true,
        settings: true,
        whatsAppCredentialsId: true,
        workspace: {
          select: {
            id: true,
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
      return notFound(res, "Typebot not found");
    if (!typebot) return notFound(res);
    if (typebot.version !== "6") return internalServerError(res);
    const block = parseGroups(typebot.groups, {
      typebotVersion: typebot.version,
    })
      .flatMap((g) => g.blocks)
      .find(byId(blockId));
    if (!block || block.type !== LogicBlockType.WEBHOOK)
      return notFound(res, "Webhook block not found");

    const result = await prisma.result.findUnique({
      where: {
        id: resultId,
      },
      select: {
        lastChatSessionId: true,
      },
    });

    if (!result?.lastChatSessionId)
      return notFound(res, "No chat session found");

    const chatSession = await getSession(result.lastChatSessionId);

    if (chatSession?.state.whatsApp) {
      if (!typebot.whatsAppCredentialsId)
        return internalServerError(
          res,
          "Found WA session but no credentialsId in typebot",
        );
      const from = chatSession.id.split("-").at(-1);
      if (!from)
        return internalServerError(
          res,
          "Expected session ID to be in format: wa-{phoneNumberId}-{receivedMessage.from}",
        );
      await resumeWhatsAppFlow({
        receivedMessage: {
          from,
          timestamp: new Date().toISOString(),
          type: "webhook",
          webhook: {
            data:
              typeof req.body === "string"
                ? JSON.stringify({ data: JSON.parse(req.body) })
                : JSON.stringify({ data: req.body }, null, 2),
          },
        },
        workspaceId: typebot.workspace.id,
        sessionId: chatSession.id,
        credentialsId: typebot.whatsAppCredentialsId,
        origin: "webhook",
      });
      return res.status(200).send("OK");
    }

    try {
      await PartySocket.fetch(
        { host: env.NEXT_PUBLIC_PARTYKIT_HOST, room: `${resultId}/webhooks` },
        {
          method: "POST",
          body:
            typeof req.body === "string"
              ? req.body
              : JSON.stringify(req.body, null, 2),
        },
      );
    } catch (error) {
      console.error("PartySocket.fetch error:", error);
      return internalServerError(res, "PartySocket.fetch error");
    }

    return res.status(200).send("OK");
  }
  return methodNotAllowed(res);
};

export default handler;
