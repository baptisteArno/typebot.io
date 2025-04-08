import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import type { InputBlock } from "@typebot.io/blocks-inputs/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { EventType } from "@typebot.io/events/constants";
import type { ReplyEvent } from "@typebot.io/events/schemas";
import type { Message } from "./schemas/api";
import {
  updateAttachmentVariablesInSession,
  updateAudioVariablesInSession,
  updateInputVariablesInSession,
  updateTextVariablesInSession,
} from "./updateVariablesInSession";

export const saveEventVariablesIfAny = ({
  state,
  event,
  reply,
}: {
  state: SessionState;
  event: ReplyEvent;
  reply: Message;
}) => {
  if (event.type !== EventType.REPLY || reply.type === "command") return state;

  const foundVariable = state.typebotsQueue[0].typebot.variables.find(
    (variable) => variable.id === event.options?.variableId,
  );
  if (!foundVariable) return state;

  return updateInputVariablesInSession({
    state,
    foundVariable,
    reply,
  });
};

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

type SaveVarProps = {
  block: InputBlock;
  reply: Message;
  state: SessionState;
};

export const saveAttachmentsVarIfAny = ({
  block,
  reply,
  state,
}: SaveVarProps): SessionState => {
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

  return updateAttachmentVariablesInSession({
    state,
    foundVariable: variable,
    reply,
  });
};

export const saveAudioClipVarIfAny = ({
  block,
  reply,
  state,
}: SaveVarProps): SessionState => {
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

  return updateAudioVariablesInSession({
    state,
    foundVariable: variable,
    reply,
  });
};

export const saveInputVarIfAny = ({
  block,
  reply,
  state,
}: SaveVarProps): SessionState => {
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
