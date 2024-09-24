import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import type { Group } from "./schemas";

export const getBlockById = (
  blockId: string,
  groups: Group[],
): { block: Block; group: Group; blockIndex: number; groupIndex: number } => {
  for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
    for (
      let blockIndex = 0;
      blockIndex < (groups.at(groupIndex)?.blocks?.length ?? 0);
      blockIndex++
    ) {
      if (groups.at(groupIndex)?.blocks?.at(blockIndex)?.id === blockId) {
        return {
          block: groups[groupIndex]!.blocks[blockIndex]!,
          group: groups[groupIndex]!,
          blockIndex,
          groupIndex,
        };
      }
    }
  }
  throw new Error(`Block with id ${blockId} was not found`);
};
