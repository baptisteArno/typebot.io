import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import type { TypebotLinkBlock } from "@typebot.io/blocks-logic/typebotLink/schema";
import { isDefined } from "@typebot.io/lib/utils";
import type { PublicTypebot } from "@typebot.io/typebot/schemas/publicTypebot";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import { fetchLinkedTypebots } from "./fetchLinkedTypebots";

type Props = {
  typebots: Pick<PublicTypebot, "groups">[];
  userId: string | undefined;
  isPreview?: boolean;
};

export const fetchLinkedChildTypebots =
  ({ typebots, userId, isPreview }: Props) =>
  async (
    capturedLinkedBots: (Typebot | PublicTypebot)[],
  ): Promise<(Typebot | PublicTypebot)[]> => {
    const linkedTypebotIds = typebots
      .flatMap((typebot) =>
        (
          typebot.groups
            .flatMap<Block>((group) => group.blocks)
            .filter(
              (block) =>
                block.type === LogicBlockType.TYPEBOT_LINK &&
                isDefined(block.options?.typebotId) &&
                !capturedLinkedBots.some(
                  (bot) =>
                    ("typebotId" in bot ? bot.typebotId : bot.id) ===
                    block.options?.typebotId,
                ),
            ) as TypebotLinkBlock[]
        ).map((b) => b.options?.typebotId),
      )
      .filter(isDefined);
    if (linkedTypebotIds.length === 0) return capturedLinkedBots;
    const linkedTypebots = (await fetchLinkedTypebots({
      userId,
      typebotIds: linkedTypebotIds,
      isPreview,
    })) as (Typebot | PublicTypebot)[];
    return fetchLinkedChildTypebots({
      typebots: linkedTypebots,
      userId,
      isPreview,
    })([...capturedLinkedBots, ...linkedTypebots]);
  };
