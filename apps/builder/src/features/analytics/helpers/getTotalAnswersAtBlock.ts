import { byId } from "@typebot.io/lib/utils";
import type { PublicTypebotV6 } from "@typebot.io/typebot/schemas/publicTypebot";
import type { TotalAnswers } from "../schemas";

export const getTotalAnswersAtBlock = (
  currentBlockId: string,
  {
    publishedTypebot,
    totalAnswers,
  }: {
    publishedTypebot: PublicTypebotV6;
    totalAnswers: TotalAnswers[];
  },
): number => {
  const block = publishedTypebot.groups
    .flatMap((g) => g.blocks)
    .find(byId(currentBlockId));
  if (!block) throw new Error(`Block ${currentBlockId} not found`);
  return totalAnswers.find((t) => t.blockId === block.id)?.total ?? 0;
};
