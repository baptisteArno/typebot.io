import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import type { InputBlock } from "@typebot.io/blocks-inputs/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { Message } from "./schemas/api";
import {
  updateTextVariablesInSession,
  updateVariablesInSession,
} from "./updateVariablesInSession";

export const saveVariablesValueIfAny =
  (state: SessionState, block: InputBlock) =>
  (reply: Message): SessionState => {
    let newSessionState = saveAttachmentsVarIfAny({ block, reply, state });
    newSessionState = saveAudioClipVarIfAny({
      block,
      reply,
      state: newSessionState,
    });
    return saveInputVarIfAny({ block, reply, state: newSessionState });
  };

export const saveAttachmentsVarIfAny = ({
  block,
  reply,
  state,
}: {
  block: InputBlock;
  reply: Message;
  state: SessionState;
}): SessionState => {
  if (
    reply.type !== "text" ||
    block.type !== InputBlockType.TEXT ||
    !block.options?.attachments?.isEnabled ||
    !block.options?.attachments?.saveVariableId ||
    !reply.attachedFileUrls ||
    reply.attachedFileUrls.length === 0
  )
    return state;

  const variable = state.typebotsQueue[0].typebot.variables.find(
    (variable) => variable.id === block.options?.attachments?.saveVariableId,
  );

  if (!variable) return state;

  const { updatedState } = updateVariablesInSession({
    newVariables: [
      {
        id: variable.id,
        name: variable.name,
        value: Array.isArray(variable.value)
          ? variable.value.concat(reply.attachedFileUrls)
          : reply.attachedFileUrls.length === 1
            ? reply.attachedFileUrls[0]
            : reply.attachedFileUrls,
      },
    ],
    currentBlockId: undefined,
    state,
  });
  return updatedState;
};

export const saveAudioClipVarIfAny = ({
  block,
  reply,
  state,
}: {
  block: InputBlock;
  reply: Message;
  state: SessionState;
}): SessionState => {
  if (
    reply.type !== "audio" ||
    block.type !== InputBlockType.TEXT ||
    !block.options?.audioClip?.isEnabled ||
    !block.options?.audioClip?.saveVariableId
  )
    return state;

  const variable = state.typebotsQueue[0].typebot.variables.find(
    (variable) => variable.id === block.options?.audioClip?.saveVariableId,
  );

  if (!variable) return state;

  const { updatedState } = updateVariablesInSession({
    newVariables: [
      {
        id: variable.id,
        name: variable.name,
        value: reply.url,
      },
    ],
    currentBlockId: undefined,
    state,
  });

  return updatedState;
};

export const saveInputVarIfAny = ({
  block,
  reply,
  state,
}: {
  block: InputBlock;
  reply: Message;
  state: SessionState;
}): SessionState => {
  if (reply.type !== "text" || !block.options?.variableId) return state;

  const foundVariable = state.typebotsQueue[0].typebot.variables.find(
    (variable) => variable.id === block.options?.variableId,
  );
  if (!foundVariable) return state;

  return updateTextVariablesInSession({
    state,
    foundVariable,
    reply,
  });
};
