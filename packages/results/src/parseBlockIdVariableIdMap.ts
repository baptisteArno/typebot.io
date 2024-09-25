import { isInputBlock } from "@typebot.io/blocks-core/helpers";
import type { GroupV6 } from "@typebot.io/groups/schemas";

export const parseBlockIdVariableIdMap = (
  groups?: GroupV6[],
): {
  [key: string]: string;
} => {
  if (!groups) return {};
  const blockIdVariableIdMap: { [key: string]: string } = {};
  groups.forEach((group) => {
    group.blocks.forEach((block) => {
      if (isInputBlock(block) && block.options?.variableId) {
        blockIdVariableIdMap[block.id] = block.options.variableId;
      }
    });
  });
  return blockIdVariableIdMap;
};
