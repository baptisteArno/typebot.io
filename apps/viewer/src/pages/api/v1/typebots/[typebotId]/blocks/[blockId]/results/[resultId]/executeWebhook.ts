import { authenticateUser } from "@/helpers/authenticateUser";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import { getSession } from "@typebot.io/bot-engine/queries/getSession";
import { env } from "@typebot.io/env";
import { parseGroups } from "@typebot.io/groups/schemas";
import {
  badRequest,
  forbidden,
  methodNotAllowed,
  notFound,
} from "@typebot.io/lib/api/utils";
import { byId } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
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
        workspaceId: true,
        groups: true,
        settings: true,
        whatsAppCredentialsId: true,
      },
    });
    if (!typebot) return notFound(res);
    if (typebot.version !== "6") return badRequest(res);
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
        return badRequest(
          res,
          "Found WA session but no credentialsId in typebot",
        );
      await resumeWhatsAppFlow({
        receivedMessage: {
          from: chatSession.id.split("-").at(-1)!,
          timestamp: new Date().toISOString(),
          type: "webhook",
          webhook: {
            data:
              typeof req.body === "string"
                ? JSON.stringify({ data: JSON.parse(req.body) })
                : JSON.stringify({ data: req.body }, null, 2),
          },
        },
        sessionId: chatSession.id,
        credentialsId: typebot.whatsAppCredentialsId,
        force: true,
      });
      return res.status(200).send("OK");
    }

    PartySocket.fetch(
      { host: env.NEXT_PUBLIC_PARTYKIT_HOST, room: `${resultId}/webhooks` },
      {
        method: "POST",
        body:
          typeof req.body === "string"
            ? req.body
            : JSON.stringify(req.body, null, 2),
      },
    );

    return res.status(200).send("OK");
  }
  return methodNotAllowed(res);
};

export default handler;
