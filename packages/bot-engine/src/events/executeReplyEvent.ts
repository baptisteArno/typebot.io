import type { SessionState } from "@typebot.io/chat-session/schemas";
import { executeCondition } from "@typebot.io/conditions/executeCondition";
import { EventType } from "@typebot.io/events/constants";
import type { ReplyEvent } from "@typebot.io/events/schemas";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import type { InputMessage } from "../schemas/api";
import { updateTextVariablesInSession } from "../updateVariablesInSession";
import { executeEvent } from "./executeEvent";

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
  const event =
    reply.type === "text"
      ? (state.typebotsQueue[0].typebot.events?.find(
          (e) => e.type === EventType.REPLY,
        ) as ReplyEvent | undefined)
      : undefined;

  if (!event) return state;

  const foundVariable = state.typebotsQueue[0].typebot.variables.find(
    (variable) => variable.id === event.options?.variableId,
  );

  if (foundVariable) {
    state = updateTextVariablesInSession({
      state,
      foundVariable,
      reply,
    });
  }

  if (
    !event.options?.exitCondition?.isEnabled ||
    !event.options.exitCondition.condition
  )
    return state;

  const isConditionMet = executeCondition(
    event.options.exitCondition.condition,
    {
      variables: state.typebotsQueue[0].typebot.variables,
      sessionStore,
    },
  );

  if (!isConditionMet) return state;

  return await executeEvent({
    state,
    event,
  });
};
