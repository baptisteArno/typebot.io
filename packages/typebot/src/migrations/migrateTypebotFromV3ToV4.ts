import { isWebhookBlock } from "@typebot.io/blocks-core/helpers";
import { migrateWebhookBlock } from "@typebot.io/blocks-core/migrations/migrateWebhookBlock";
import { isDefined } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import type { PublicTypebotV5 } from "../schemas/publicTypebot";
import type { TypebotV5 } from "../schemas/typebot";

export const migrateTypebotFromV3ToV4 = async (
  typebot: TypebotV5 | PublicTypebotV5,
): Promise<Omit<TypebotV5 | PublicTypebotV5, "version"> & { version: "4" }> => {
  if (typebot.version === "4")
    return typebot as Omit<TypebotV5, "version"> & { version: "4" };
  const webhookBlocks = typebot.groups
    .flatMap((group) => group.blocks)
    .filter(isWebhookBlock);
  const webhooks = await prisma.webhook.findMany({
    where: {
      id: {
        in: webhookBlocks
          .map((block) => ("webhookId" in block ? block.webhookId : undefined))
          .filter(isDefined),
      },
    },
  });
  return {
    ...typebot,
    version: "4",
    groups: typebot.groups.map((group) => ({
      ...group,
      blocks: group.blocks.map(migrateWebhookBlock(webhooks)),
    })),
  };
};
