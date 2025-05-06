import type { JumpBlock } from "@typebot.io/blocks-logic/jump/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { addVirtualEdge } from "../../../addPortalEdge";
import { getNextBlock } from "../../../getNextBlock";
import type { ExecuteLogicResponse } from "../../../types";

export const executeJumpBlock = (
  state: SessionState,
  block: JumpBlock,
): ExecuteLogicResponse => {
  const { groupId, blockId } = block.options ?? {};
  if (!groupId) return { outgoingEdgeId: undefined };
  const { typebot } = state.typebotsQueue[0];
  const groupToJumpTo = typebot.groups.find((group) => group.id === groupId);
  const blockToJumpTo = groupToJumpTo?.blocks.find(
    (block) => block.id === blockId,
  );

  if (blockId && !blockToJumpTo)
    return {
      outgoingEdgeId: null,
      logs: [
        {
          context: "Error while executing Jump block",
          description: "Block to jump to is not found",
        },
      ],
    };

  const { newSessionState, edgeId } = addVirtualEdge(state, {
    to: { groupId, blockId: blockToJumpTo?.id },
  });

  const nextBlock = getNextBlock(block.id, {
    groups: typebot.groups,
    edges: typebot.edges,
  });

  if (nextBlock)
    newSessionState.returnMark = {
      status: "pending",
      blockId: nextBlock.id,
    };

  return {
    outgoingEdgeId: edgeId,
    newSessionState,
  };
};
