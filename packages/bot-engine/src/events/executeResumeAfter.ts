import { TRPCError } from "@trpc/server";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { EventType } from "@typebot.io/events/constants";
import type { TEvent } from "@typebot.io/events/schemas";
import { getBlockById } from "@typebot.io/groups/helpers/getBlockById";
import { addPortalEdge } from "../addPortalEdge";
import { getNextBlockById } from "../getNextGroup";

export const executeResumeAfter = async ({
  state,
  event,
}: {
  state: SessionState;
  event: TEvent;
}) => {
  if (!state.currentBlockId) return state;

  const portalEdge =
    event.type === EventType.REPLY
      ? await getNextBlockById(
          state,
          state.currentBlockId,
          state.typebotsQueue[0].typebot.groups,
        )
      : getBlockById(
          state.currentBlockId,
          state.typebotsQueue[0].typebot.groups,
        );

  let newSessionState = state;

  if (portalEdge) {
    const { group, block } = portalEdge;
    newSessionState = addPortalEdge(`virtual-${event.id}`, newSessionState, {
      to: { groupId: group.id, blockId: block.id },
    });
  }

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
