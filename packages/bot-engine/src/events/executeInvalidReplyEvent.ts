import { TRPCError } from "@trpc/server";
import type { InputMessage } from "@typebot.io/chat-api/schemas";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { InvalidReplyEvent } from "@typebot.io/events/schemas";
import { byId } from "@typebot.io/lib/utils";
import { addDummyFirstBlockToGroupIfMissing } from "../addDummyFirstBlockToGroupIfMissing";
import { setReplyEventVariables } from "./saveReplyVariables";

type Props = {
  state: SessionState;
  reply: InputMessage;
};
export const executeInvalidReplyEvent = (
  event: InvalidReplyEvent,
  { state, reply }: Props,
) => {
  let newSessionState = state;

  const { updatedState, newSetVariableHistory } = setReplyEventVariables(
    reply,
    {
      state,
      options: event.options,
    },
  );

  newSessionState = updatedState;

  if (newSessionState.currentBlockId)
    newSessionState.returnMark = {
      status: "pending",
      blockId: newSessionState.currentBlockId,
    };

  const nextEdge = newSessionState.typebotsQueue[0].typebot.edges.find(
    byId(event.outgoingEdgeId),
  );
  if (!nextEdge)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Command event doesn't have a connected edge",
    });
  const nextGroup = newSessionState.typebotsQueue[0].typebot.groups.find(
    byId(nextEdge.to.groupId),
  );
  if (!nextGroup)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Command event doesn't have a connected group",
    });
  const nextBlockIndex = nextGroup.blocks.findIndex(byId(nextEdge.to.blockId));
  const newBlockId = `virtual-${event.id}-block`;
  newSessionState = addDummyFirstBlockToGroupIfMissing(
    newBlockId,
    newSessionState,
    {
      groupId: nextGroup.id,
      index: nextBlockIndex !== -1 ? nextBlockIndex : 0,
    },
  );
  newSessionState.currentBlockId = newBlockId;
  return {
    updatedState: newSessionState,
    newSetVariableHistory,
  };
};
