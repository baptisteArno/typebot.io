import { authenticateUser } from "@/helpers/authenticateUser";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
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
import { isReadTypebotForbidden } from "@typebot.io/typebot/helpers/isReadTypebotForbidden";
import type { NextApiRequest, NextApiResponse } from "next";
import PartySocket from "partysocket";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    if (!env.NEXT_PUBLIC_PARTYKIT_HOST) return notFound(res);
    const user = await authenticateUser(req);
    if (!user) return forbidden(res, "User not authenticated");
    const typebotId = req.query.typebotId as string;
    const blockId = req.query.blockId as string;
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

    try {
      await PartySocket.fetch(
        {
          host: env.NEXT_PUBLIC_PARTYKIT_HOST,
          room: `${user.id}/${typebotId}/webhooks`,
        },
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
      return res.status(500).send("PartySocket.fetch error");
    }

    return res.status(200).send("OK");
  }
  return methodNotAllowed(res);
};

export default handler;
