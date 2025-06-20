import type { JumpBlock } from "@typebot.io/blocks-logic/jump/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { byId } from "@typebot.io/lib/utils";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { isSingleVariable } from "@typebot.io/variables/isSingleVariable";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import { addVirtualEdge } from "../../../addPortalEdge";
import { getNextBlock } from "../../../getNextBlock";
import type { ExecuteLogicResponse } from "../../../types";

export const executeJumpBlock = (
  block: JumpBlock,
  { state, sessionStore }: { state: SessionState; sessionStore: SessionStore },
): ExecuteLogicResponse => {
  const { groupId, blockId } = block.options ?? {};
  if (!groupId) return { outgoingEdgeId: undefined };
  const { typebot } = state.typebotsQueue[0];
  const groupTitle = isSingleVariable(groupId)
    ? parseVariables(groupId, {
        sessionStore: sessionStore,
        variables: state.typebotsQueue[0].typebot.variables,
      })
    : undefined;

  const groupToJumpTo = groupTitle
    ? typebot.groups.find((group) => group.title === groupTitle)
    : typebot.groups.find(byId(groupId));

  if (!groupToJumpTo) {
    return {
      outgoingEdgeId: null,
      logs: [
        {
          context: "Error while executing Jump block",
          description: "Group to jump to is not found",
          details: JSON.stringify({
            groupIdOrTitle: groupTitle ?? groupId,
            jumpBlockId: block.id,
          }),
        },
      ],
    };
  }

  const blockToJumpTo = groupToJumpTo.blocks.find(
    (block) => block.id === blockId,
  );

  if (blockId && !blockToJumpTo)
    return {
      outgoingEdgeId: null,
      logs: [
        {
          context: "Error while executing Jump block",
          description: "Block to jump to is not found",
          details: JSON.stringify({
            groupIdOrTitle: groupTitle ?? groupId,
            blockId: blockId,
            jumpBlockId: block.id,
          }),
        },
      ],
    };

  const { newSessionState, edgeId } = addVirtualEdge(state, {
    to: { groupId: groupToJumpTo.id, blockId: blockToJumpTo?.id },
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
