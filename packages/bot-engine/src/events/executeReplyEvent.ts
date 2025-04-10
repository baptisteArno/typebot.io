import { isInputBlock } from "@typebot.io/blocks-core/helpers";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { ReplyEvent } from "@typebot.io/events/schemas";
import { getBlockById } from "@typebot.io/groups/helpers/getBlockById";
import type { InputMessage } from "../schemas/api";
import { updateVariablesInSession } from "../updateVariablesInSession";
import { connectEdgeToNextBlock } from "./connectEdgeToNextBlock";
import { updateCurrentBlockIdWithEvent } from "./updateCurrentBlockIdWithEvent";

type Props = {
  state: SessionState;
  reply: InputMessage;
  replyEvent: ReplyEvent;
};

export const executeReplyEvent = ({
  state,
  reply,
  replyEvent: event,
}: Props) => {
  if (!state.currentBlockId)
    return { updatedState: state, setVariableHistory: [] };

  let newSessionState = state;

  const foundVariable = state.typebotsQueue[0].typebot.variables.find(
    (variable) => variable.id === event.options?.variableId,
  );
  if (!foundVariable) return { updatedState: state, setVariableHistory: [] };

  const { updatedState, newSetVariableHistory } = updateVariablesInSession({
    state: newSessionState,
    newVariables: [
      {
        ...foundVariable,
        value:
          Array.isArray(foundVariable.value) && reply.type === "text"
            ? foundVariable.value.concat(reply.text)
            : reply.type === "text"
              ? reply.text
              : reply.url,
      },
    ],
    currentBlockId: state.currentBlockId,
  });

  newSessionState = updatedState;

  newSessionState = connectEdgeToNextBlock({
    state: newSessionState,
    event,
  });

  return {
    updatedState: updateCurrentBlockIdWithEvent({
      state: newSessionState,
      event,
    }),
    newSetVariableHistory,
  };
};
