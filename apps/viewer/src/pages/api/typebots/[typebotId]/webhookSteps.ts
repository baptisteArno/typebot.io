import { authenticateUser } from "@/helpers/authenticateUser";
import { isWebhookBlock } from "@typebot.io/blocks-core/helpers";
import type { Group } from "@typebot.io/groups/schemas";
import { methodNotAllowed } from "@typebot.io/lib/api/utils";
import { isNotDefined } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    const user = await authenticateUser(req);
    if (!user) return res.status(401).json({ message: "Not authenticated" });
    const typebotId = req.query.typebotId as string;
    const typebot = await prisma.typebot.findFirst({
      where: {
        id: typebotId,
        workspace: { members: { some: { userId: user.id } } },
      },
      select: { groups: true, webhooks: true },
    });
    const emptyWebhookBlocks = (typebot?.groups as Group[]).reduce<
      { groupId: string; id: string; name: string }[]
    >((emptyWebhookBlocks, group) => {
      const blocks = group.blocks.filter(
        (block) =>
          isWebhookBlock(block) &&
          isNotDefined(
            typebot?.webhooks.find((w) => {
              if ("id" in w && "webhookId" in block)
                return w.id === block.webhookId;
              return false;
            })?.url,
          ),
      );
      return [
        ...emptyWebhookBlocks,
        ...blocks.map((b) => ({
          id: b.id,
          groupId: group.id,
          name: `${group.title} > ${b.id}`,
        })),
      ];
    }, []);
    return res.send({ steps: emptyWebhookBlocks });
  }
  return methodNotAllowed(res);
};

export default handler;
