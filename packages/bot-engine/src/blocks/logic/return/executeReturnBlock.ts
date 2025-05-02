import type { SessionState } from "@typebot.io/chat-session/schemas";
import { getBlockById } from "@typebot.io/groups/helpers/getBlockById";
import { addVirtualEdge } from "../../../addPortalEdge";
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
      outgoingEdgeId: null,
      logs: [
        {
          context: "Error while executing Return block",
          description: "Could not find block to return to",
        },
      ],
    };

  const { newSessionState, edgeId } = addVirtualEdge(state, {
    to: { groupId: group.id, blockId: blockToReturnTo.id },
  });

  newSessionState.returnMark = undefined;

  return {
    outgoingEdgeId: edgeId,
    newSessionState,
  };
};
