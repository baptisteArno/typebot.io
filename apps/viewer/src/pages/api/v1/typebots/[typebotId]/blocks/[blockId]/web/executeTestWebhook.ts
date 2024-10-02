import { authenticateUser } from "@/helpers/authenticateUser";
import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import type { HttpRequest } from "@typebot.io/blocks-integrations/httpRequest/schema";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import { env } from "@typebot.io/env";
import {
  forbidden,
  methodNotAllowed,
  notFound,
} from "@typebot.io/lib/api/utils";
import { byId } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import type { NextApiRequest, NextApiResponse } from "next";
import PartySocket from "partysocket";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    if (!env.NEXT_PUBLIC_PARTYKIT_HOST) return notFound(res);
    const user = await authenticateUser(req);
    if (!user) return forbidden(res, "User not authenticated");
    const typebotId = req.query.typebotId as string;
    const blockId = req.query.blockId as string;
    const typebot = (await prisma.typebot.findUnique({
      where: { id: typebotId },
      include: { webhooks: true },
    })) as unknown as (Typebot & { webhooks: HttpRequest[] }) | null;
    if (!typebot) return notFound(res);
    const block = typebot.groups
      .flatMap<Block>((g) => g.blocks)
      .find(byId(blockId));
    if (!block || block.type !== LogicBlockType.WEBHOOK)
      return notFound(res, "Webhook block not found");

    PartySocket.fetch(
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

    return res.status(200).send("OK");
  }
  return methodNotAllowed(res);
};

export default handler;
