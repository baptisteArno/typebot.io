import { authenticateUser } from "@/helpers/authenticateUser";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import { getSession } from "@typebot.io/bot-engine/queries/getSession";
import { env } from "@typebot.io/env";
import { parseGroups } from "@typebot.io/groups/schemas";
import { badRequest, forbidden, notFound } from "@typebot.io/lib/api/utils";
import { byId } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import { isReadTypebotForbidden } from "@typebot.io/typebot/helpers/isReadTypebotForbidden";
import { resumeWhatsAppFlow } from "@typebot.io/whatsapp/resumeWhatsAppFlow";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    if (!env.NEXT_PUBLIC_PARTYKIT_HOST) return notFound(res);
    const user = await authenticateUser(req);
    if (!user) return forbidden(res, "User not authenticated");
    const typebotId = req.query.typebotId as string;
    const blockId = req.query.blockId as string;
    const phone = req.query.phone as string;
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
      return notFound(res, "Typebot not found");
    if (typebot.version !== "6") return badRequest(res);
    const block = parseGroups(typebot.groups, {
      typebotVersion: typebot.version,
    })
      .flatMap((g) => g.blocks)
      .find(byId(blockId));
    if (!block || block.type !== LogicBlockType.WEBHOOK)
      return notFound(res, "Webhook block not found");

    const chatSession = await getSession(`wa-preview-${phone}`);

    if (!chatSession?.state.whatsApp)
      return badRequest(res, "Expected whatsapp chat session");

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
      origin: "webhook",
    });
    return res.status(200).send("OK");
  }
};

export default handler;
