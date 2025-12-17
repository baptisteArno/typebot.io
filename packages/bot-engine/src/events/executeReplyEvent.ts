import { ORPCError } from "@orpc/server";
import type { InputMessage } from "@typebot.io/chat-api/schemas";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { ReplyEvent } from "@typebot.io/events/schemas";
import { setReplyEventVariables } from "./saveReplyVariables";
import { updateCurrentBlockIdWithEvent } from "./updateCurrentBlockIdWithEvent";

type Props = {
  state: SessionState;
  reply: InputMessage;
};

type ReplyEventWithDefinedOutgoingEdgeId = Omit<
  ReplyEvent,
  "outgoingEdgeId"
> & {
  outgoingEdgeId: string;
};

export const executeReplyEvent = (
  event: ReplyEventWithDefinedOutgoingEdgeId,
  { state, reply }: Props,
) => {
  if (!state.currentBlockId)
    throw new ORPCError("BAD_REQUEST", {
      message: "In executeReplyEvent, current block id is not set",
    });

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
      autoResumeMessage: reply,
    };

  return {
    updatedState: updateCurrentBlockIdWithEvent({
      state: newSessionState,
      event,
    }),
    newSetVariableHistory,
  };
};
