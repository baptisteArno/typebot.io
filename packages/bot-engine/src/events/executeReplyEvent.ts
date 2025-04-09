import { isInputBlock } from "@typebot.io/blocks-core/helpers";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { ReplyEvent } from "@typebot.io/events/schemas";
import { getBlockById } from "@typebot.io/groups/helpers/getBlockById";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { getOutgoingEdgeId } from "../getOutgoingEdgeId";
import { parseReply } from "../parseReply";
import {
  saveEventVariablesIfAny,
  saveVariablesValueIfAny,
} from "../saveVariables";
import type { InputMessage } from "../schemas/api";
import { connectEdgeToNextBlock } from "./connectEdgeToNextBlock";
import { updateCurrentBlockIdWithEvent } from "./updateCurrentBlockIdWithEvent";

type Props = {
  state: SessionState;
  reply: InputMessage;
  sessionStore: SessionStore;
  replyEvent: ReplyEvent;
};

export const executeReplyEvent = async ({
  state,
  reply,
  sessionStore,
  replyEvent: event,
}: Props) => {
  if (!state.currentBlockId) return state;
  const { block } = getBlockById(
    state.currentBlockId,
    state.typebotsQueue[0].typebot.groups,
  );

  if (!isInputBlock(block)) return state;

  let newSessionState = state;

  // Save the input variable of the event if any
  newSessionState = saveEventVariablesIfAny({
    state: newSessionState,
    event,
    reply,
  });

  // Save the trigger block variable if any
  newSessionState = saveVariablesValueIfAny(newSessionState, block)(reply);

  // Anticipate the next edge by pre-parsing the reply
  const parsedReply = await parseReply(reply, {
    sessionStore,
    state: newSessionState,
    block,
  });

  let nextEdgeId: string | undefined;
  if (parsedReply.status === "success") {
    const { edgeId } = getOutgoingEdgeId(parsedReply, {
      block,
      state: newSessionState,
      sessionStore,
    });
    nextEdgeId = edgeId;
  }

  newSessionState = await connectEdgeToNextBlock({
    state: newSessionState,
    event,
    sessionStore,
    nextEdgeId,
  });

  return await updateCurrentBlockIdWithEvent({
    state: newSessionState,
    event,
    sessionStore,
  });
};
