import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import type { TypebotInSession } from "@typebot.io/chat-session/schemas";
import { byId } from "@typebot.io/lib/utils";

export const getNextBlock = (
  blockId: string,
  { groups, edges }: Pick<TypebotInSession, "groups" | "edges">,
): (Block & { groupId: string }) | undefined => {
  const group = groups.find((group) => group.blocks.find(byId(blockId)));
  if (!group) return;
  const blockIndex = group.blocks.findIndex(byId(blockId));
  const nextBlockInGroup = group.blocks.at(blockIndex + 1);
  if (nextBlockInGroup) return { ...nextBlockInGroup, groupId: group.id };
  const outgoingEdgeId = group.blocks.at(blockIndex)?.outgoingEdgeId;
  if (!outgoingEdgeId) return;
  const outgoingEdge = edges.find(byId(outgoingEdgeId));
  if (!outgoingEdge) return;
  const connectedGroup = groups.find(byId(outgoingEdge?.to.groupId));
  if (!connectedGroup) return;
  if (outgoingEdge.to.blockId) {
    const block = connectedGroup.blocks.find(
      (block) => block.id === outgoingEdge.to.blockId,
    );
    if (!block) return;
    return { ...block, groupId: connectedGroup.id };
  }
  const firstBlock = connectedGroup.blocks.at(0);
  if (!firstBlock) return;
  return { ...firstBlock, groupId: connectedGroup.id };
};
