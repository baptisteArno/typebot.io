import { authenticateUser } from "@/helpers/authenticateUser";
import { isWebhookBlock } from "@typebot.io/blocks-core/helpers";
import type { HttpRequestBlock } from "@typebot.io/blocks-integrations/webhook/schema";
import type { Group } from "@typebot.io/groups/schemas";
import { methodNotAllowed } from "@typebot.io/lib/api/utils";
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
      { blockId: string; name: string; url: string | undefined }[]
    >((emptyWebhookBlocks, group) => {
      const blocks = group.blocks.filter((block) =>
        isWebhookBlock(block),
      ) as HttpRequestBlock[];
      return [
        ...emptyWebhookBlocks,
        ...blocks.map((b) => ({
          blockId: b.id,
          name: `${group.title} > ${b.id}`,
          url:
            typebot?.webhooks.find((w) => {
              if ("id" in w && "webhookId" in b) return w.id === b.webhookId;
              return false;
            })?.url ?? undefined,
        })),
      ];
    }, []);
    return res.send({ blocks: emptyWebhookBlocks });
  }
  return methodNotAllowed(res);
};

export default handler;
