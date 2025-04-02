import { TRPCError } from "@trpc/server";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { TEvent } from "@typebot.io/events/schemas";
import { getBlockById } from "@typebot.io/groups/helpers/getBlockById";
import { addPortalEdge } from "../addPortalEdge";

export const executeResumeAfter = ({
  state,
  event,
}: {
  state: SessionState;
  event: TEvent;
}) => {
  if (!state.currentBlockId) return state;

  const { block, group } = getBlockById(
    state.currentBlockId,
    state.typebotsQueue[0].typebot.groups,
  );

  if (!block)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Block not found",
    });

  let newSessionState = state;

  newSessionState = addPortalEdge(`virtual-${event.id}`, newSessionState, {
    to: { groupId: group.id, blockId: block.id },
  });
  newSessionState = {
    ...newSessionState,
    typebotsQueue: [
      {
        ...newSessionState.typebotsQueue[0],
        queuedEdgeIds: newSessionState.typebotsQueue[0].queuedEdgeIds
          ? [
              `virtual-${event.id}`,
              ...newSessionState.typebotsQueue[0].queuedEdgeIds,
            ]
          : [`virtual-${event.id}`],
      },
      ...newSessionState.typebotsQueue.slice(1),
    ],
  };

  return newSessionState;
};
