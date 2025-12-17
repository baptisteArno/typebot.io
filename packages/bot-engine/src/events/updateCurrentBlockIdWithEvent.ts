import { ORPCError } from "@orpc/server";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { TDraggableEvent } from "@typebot.io/events/schemas";
import { addDummyFirstBlockToGroupIfMissing } from "../addDummyFirstBlockToGroupIfMissing";

type Props = {
  state: SessionState;
  event: TDraggableEvent & { outgoingEdgeId: string };
};

export const updateCurrentBlockIdWithEvent = ({ state, event }: Props) => {
  let newSessionState = state;

  const edge = newSessionState.typebotsQueue[0].typebot.edges.find(
    (edge) => edge.id === event.outgoingEdgeId,
  );

  if (!edge)
    throw new ORPCError("BAD_REQUEST", {
      message: `Could not find outgoing edge`,
    });

  newSessionState = addDummyFirstBlockToGroupIfMissing(
    `virtual-${event.id}-block`,
    newSessionState,
    {
      groupId: edge.to.groupId,
      index: 0,
    },
  );
  return {
    ...newSessionState,
    currentBlockId: `virtual-${event.id}-block`,
  };
};
