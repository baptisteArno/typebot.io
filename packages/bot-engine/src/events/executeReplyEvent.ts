import type { SessionState } from "@typebot.io/chat-session/schemas";
import { executeCondition } from "@typebot.io/conditions/executeCondition";
import { EventType } from "@typebot.io/events/constants";
import type { ReplyEvent } from "@typebot.io/events/schemas";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { removePortalEdge } from "../removePortalEdge";
import type { InputMessage } from "../schemas/api";
import { updateTextVariablesInSession } from "../updateVariablesInSession";
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

  let newSessionState = state;

  if (foundVariable) {
    newSessionState = updateTextVariablesInSession({
      state: newSessionState,
      foundVariable,
      reply,
    });
  }

  const isEntryConditionMet =
    !event.options?.entryCondition?.isEnabled ||
    (event.options?.entryCondition?.condition &&
      executeCondition(event.options.entryCondition.condition, {
        variables: newSessionState.typebotsQueue[0].typebot.variables,
        sessionStore,
      }));

  if (!isEntryConditionMet) return newSessionState;

  const isExitConditionMet =
    event.options?.exitCondition?.isEnabled &&
    event.options?.exitCondition?.condition &&
    executeCondition(event.options.exitCondition.condition, {
      variables: newSessionState.typebotsQueue[0].typebot.variables,
      sessionStore,
    });

  if (!isExitConditionMet && !newSessionState.currentEventId) {
    newSessionState = await executeResumeAfter({
      state: newSessionState,
      event,
    });
    newSessionState.currentEventId = event.id;
  } else if (isExitConditionMet) {
    newSessionState = removePortalEdge(
      `virtual-${newSessionState.currentEventId}`,
      newSessionState,
    );
  }

  return await executeEvent({
    state: newSessionState,
    event,
  });
};
