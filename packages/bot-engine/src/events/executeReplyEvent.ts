import { isInputBlockType } from "@typebot.io/blocks-core/helpers";
import { replyEventInputTypeFromEnum } from "@typebot.io/blocks-inputs/constants";
import type { InputMessage } from "@typebot.io/chat-api/schemas";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { ReplyEvent } from "@typebot.io/events/schemas";
import { getBlockById } from "@typebot.io/groups/helpers/getBlockById";
import type { VariableWithUnknowValue } from "@typebot.io/variables/schemas";
import { updateVariablesInSession } from "../updateVariablesInSession";
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

  const newVariables: VariableWithUnknowValue[] = [];

  const contentVariableToUpdate = state.typebotsQueue[0].typebot.variables.find(
    (variable) => variable.id === event.options?.contentVariableId,
  );
  const inputTypeVariableToUpdate =
    state.typebotsQueue[0].typebot.variables.find(
      (variable) => variable.id === event.options?.inputTypeVariableId,
    );
  const inputNameVariableToUpdate =
    state.typebotsQueue[0].typebot.variables.find(
      (variable) => variable.id === event.options?.inputNameVariableId,
    );
  const currentBlockMeta =
    inputTypeVariableToUpdate || inputNameVariableToUpdate
      ? getBlockById(
          state.currentBlockId,
          state.typebotsQueue[0].typebot.groups,
        )
      : undefined;

  if (contentVariableToUpdate) {
    newVariables.push({
      ...contentVariableToUpdate,
      value: reply.type === "text" ? reply.text : reply.url,
    });
  }

  if (
    inputTypeVariableToUpdate &&
    currentBlockMeta &&
    isInputBlockType(currentBlockMeta.block.type)
  ) {
    newVariables.push({
      ...inputTypeVariableToUpdate,
      value: replyEventInputTypeFromEnum[currentBlockMeta.block.type],
    });
  }

  if (inputNameVariableToUpdate && currentBlockMeta) {
    newVariables.push({
      ...inputNameVariableToUpdate,
      value: currentBlockMeta?.group.title,
    });
  }

  const { updatedState, newSetVariableHistory } = updateVariablesInSession({
    state: newSessionState,
    newVariables,
    currentBlockId: state.currentBlockId,
  });

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
