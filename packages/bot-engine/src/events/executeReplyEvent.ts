import { isInputBlock } from "@typebot.io/blocks-core/helpers";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { EventType } from "@typebot.io/events/constants";
import type { ReplyEvent } from "@typebot.io/events/schemas";
import { getBlockById } from "@typebot.io/groups/helpers/getBlockById";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import {
  saveEventVariablesIfAny,
  saveVariablesValueIfAny,
} from "../saveVariables";
import type { InputMessage } from "../schemas/api";
import { executeEvent } from "./executeEvent";
import { executeResumeAfter } from "./executeResumeAfter";

type Props = {
  state: SessionState;
  reply: InputMessage;
  sessionStore: SessionStore;
};

export const executeReplyEvent = async ({
  state,
  reply,
  sessionStore,
}: Props) => {
  const event = state.typebotsQueue[0].typebot.events?.find(
    (e) => e.type === EventType.REPLY,
  ) as ReplyEvent | undefined;

  if (!event) return state;

  let newSessionState = state;

  // Save the input variable of the event if any
  newSessionState = saveEventVariablesIfAny({
    state: newSessionState,
    event,
    reply,
  });

  // Save the trigger block variable if any
  if (state.currentBlockId) {
    const { block } = getBlockById(
      state.currentBlockId,
      state.typebotsQueue[0].typebot.groups,
    );
    if (isInputBlock(block)) {
      newSessionState = saveVariablesValueIfAny(newSessionState, block)(reply);
    }
  }

  newSessionState = await executeResumeAfter({
    state: newSessionState,
    event,
    sessionStore,
  });

  return await executeEvent({
    state: newSessionState,
    event,
    sessionStore,
  });
};
