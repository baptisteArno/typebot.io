import type { SessionState } from "@typebot.io/chat-session/schemas";
import { getBlockById } from "@typebot.io/groups/helpers/getBlockById";
import { addPortalEdge } from "../../../addPortalEdge";
import type { ExecuteLogicResponse } from "../../../types";

export const executeReturnBlock = (
  state: SessionState,
): ExecuteLogicResponse => {
  const { blockId } = state.returnMark ?? {};
  if (!blockId) return { outgoingEdgeId: undefined };
  const { typebot } = state.typebotsQueue[0];
  const { group, block: blockToReturnTo } = getBlockById(
    blockId,
    typebot.groups,
  );

  if (!blockToReturnTo)
    return {
      outgoingEdgeId: undefined,
    };

  const newSessionState = addPortalEdge(`virtual-${blockId}`, state, {
    to: { groupId: group.id, blockId: blockToReturnTo.id },
  });

  newSessionState.returnMark = newSessionState.returnMark?.autoResumeMessage
    ? {
        ...newSessionState.returnMark,
        status: "called",
      }
    : undefined;

  return {
    outgoingEdgeId: `virtual-${blockId}`,
    newSessionState,
  };
};
