import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import type { TypebotInSession } from "@typebot.io/chat-session/schemas";
import { byId } from "@typebot.io/lib/utils";

export const getNextBlock = (
  blockId: string,
  { typebot }: { typebot: Pick<TypebotInSession, "groups" | "edges"> },
): { block: Block; group: { id: string } } | undefined => {
  const group = typebot.groups.find((group) =>
    group.blocks.find(byId(blockId)),
  );
  if (!group) return;
  const blockIndex = group.blocks.findIndex(byId(blockId));
  const nextBlockInGroup = group.blocks.at(blockIndex + 1);
  if (nextBlockInGroup)
    return { block: nextBlockInGroup, group: { id: group.id } };
  const outgoingEdgeId = group.blocks.at(blockIndex)?.outgoingEdgeId;
  if (!outgoingEdgeId) return;
  const outgoingEdge = typebot.edges.find(byId(outgoingEdgeId));
  if (!outgoingEdge) return;
  const connectedGroup = typebot.groups.find(byId(outgoingEdge?.to.groupId));
  if (!connectedGroup) return;
  return outgoingEdge.to.blockId
    ? {
        block: connectedGroup.blocks.find(
          (block) => block.id === outgoingEdge.to.blockId,
        )!,
        group: { id: connectedGroup.id },
      }
    : {
        block: connectedGroup?.blocks.at(0)!,
        group: { id: connectedGroup.id },
      };
};
