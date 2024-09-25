import { canReadTypebots } from "@/helpers/databaseRules";
import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import prisma from "@typebot.io/prisma";
import type { Prisma } from "@typebot.io/prisma/types";
import type { User } from "@typebot.io/schemas/features/user/schema";
import type { PublicTypebot } from "@typebot.io/typebot/schemas/publicTypebot";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";

export const fetchLinkedTypebots = async (
  typebot: Pick<PublicTypebot, "groups">,
  user?: Prisma.User,
): Promise<(Typebot | PublicTypebot)[]> => {
  const linkedTypebotIds = typebot.groups
    .flatMap<Block>((group) => group.blocks)
    .reduce<string[]>((typebotIds, block) => {
      if (block.type !== LogicBlockType.TYPEBOT_LINK) return typebotIds;
      const typebotId = block.options?.typebotId;
      if (!typebotId) return typebotIds;
      return typebotIds.includes(typebotId)
        ? typebotIds
        : [...typebotIds, typebotId];
    }, []);
  if (linkedTypebotIds.length === 0) return [];
  const typebots = (await ("typebotId" in typebot
    ? prisma.publicTypebot.findMany({
        where: { id: { in: linkedTypebotIds } },
      })
    : prisma.typebot.findMany({
        where: user
          ? {
              AND: [
                { id: { in: linkedTypebotIds } },
                canReadTypebots(linkedTypebotIds, user as User),
              ],
            }
          : { id: { in: linkedTypebotIds } },
      }))) as (Typebot | PublicTypebot)[];
  return typebots;
};
