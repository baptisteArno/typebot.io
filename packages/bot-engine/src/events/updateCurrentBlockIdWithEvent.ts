import { TRPCError } from "@trpc/server";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { TDraggableEvent } from "@typebot.io/events/schemas";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { addBlockToTypebotIfMissing } from "../addBlockToTypebotIfMissing";
import { getNextGroup } from "../getNextGroup";

type Props = {
  state: SessionState;
  event: TDraggableEvent;
  sessionStore: SessionStore;
};

export const updateCurrentBlockIdWithEvent = async ({
  state,
  event,
  sessionStore,
}: Props) => {
  let newSessionState = state;

  const response = await getNextGroup({
    state: newSessionState,
    edgeId: event.outgoingEdgeId,
    isOffDefaultPath: false,
    sessionStore,
  });

  newSessionState = response.newSessionState;
  if (!response.group)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Command event doesn't have a connected group",
    });
  newSessionState = addBlockToTypebotIfMissing(
    `virtual-${event.id}-block`,
    newSessionState,
    {
      groupId: response.group.id,
      index: 0,
    },
  );
  return {
    ...newSessionState,
    currentBlockId: `virtual-${event.id}-block`,
  };
};
