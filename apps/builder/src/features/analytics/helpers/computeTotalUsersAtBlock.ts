import { isInputBlock } from "@typebot.io/blocks-core/helpers";
import { isNotDefined } from "@typebot.io/lib/utils";
import type { PublicTypebotV6 } from "@typebot.io/typebot/schemas/publicTypebot";
import type { EdgeWithTotalVisits, TotalAnswers } from "../schemas";

const buildEdgeTotalsByTarget = (edges: EdgeWithTotalVisits[]) => {
  const byBlock = new Map<string, number>();
  const byGroupRoot = new Map<string, number>(); // edge.to.blockId is undefined

  for (const edge of edges) {
    if (!edge.to) continue;
    if (isNotDefined(edge.to.blockId)) {
      byGroupRoot.set(
        edge.to.groupId,
        (byGroupRoot.get(edge.to.groupId) ?? 0) + edge.total,
      );
    } else {
      byBlock.set(
        edge.to.blockId,
        (byBlock.get(edge.to.blockId) ?? 0) + edge.total,
      );
    }
  }
  return { byBlock, byGroupRoot };
};

export const computeTotalUsersAtBlock = (
  currentBlockId: string,
  {
    publishedTypebot,
    edgesWithTotalUsers,
    totalAnswers,
  }: {
    publishedTypebot: PublicTypebotV6;
    edgesWithTotalUsers: EdgeWithTotalVisits[];
    totalAnswers: TotalAnswers[];
  },
): number => {
  const edgeTotalsByTarget = buildEdgeTotalsByTarget(edgesWithTotalUsers);
  const answersByBlock = new Map(totalAnswers.map((a) => [a.blockId, a.total]));

  const currentGroup = publishedTypebot.groups.find((g) =>
    g.blocks.some((b) => b.id === currentBlockId),
  );
  if (!currentGroup) return 0;

  const blockIndex = currentGroup.blocks.findIndex(
    (b) => b.id === currentBlockId,
  );
  if (blockIndex === -1) return 0;

  let total = 0;

  for (let i = blockIndex; i >= 0; i--) {
    const block = currentGroup.blocks[i];

    if (block.id !== currentBlockId && isInputBlock(block)) {
      return answersByBlock.get(block.id) ?? 0;
    }

    total += edgeTotalsByTarget.byBlock.get(block.id) ?? 0;
  }

  total += edgeTotalsByTarget.byGroupRoot.get(currentGroup.id) ?? 0;

  return total;
};
