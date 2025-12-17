import { ORPCError } from "@orpc/server";
import { isInputBlockType } from "@typebot.io/blocks-core/helpers";
import { replyEventInputTypeFromEnum } from "@typebot.io/blocks-inputs/constants";
import type { InputMessage } from "@typebot.io/chat-api/schemas";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { InvalidReplyEvent, ReplyEvent } from "@typebot.io/events/schemas";
import { getBlockById } from "@typebot.io/groups/helpers/getBlockById";
import type { VariableWithUnknowValue } from "@typebot.io/variables/schemas";
import { updateVariablesInSession } from "../updateVariablesInSession";

export const setReplyEventVariables = (
  reply: InputMessage,
  {
    state,
    options,
  }: {
    state: SessionState;
    options: ReplyEvent["options"] | InvalidReplyEvent["options"];
  },
) => {
  if (!state.currentBlockId)
    throw new ORPCError("BAD_REQUEST", {
      message: "In setReplyEventVariables, current block id is not set",
    });

  const newVariables: VariableWithUnknowValue[] = [];

  const contentVariableToUpdate = state.typebotsQueue[0].typebot.variables.find(
    (variable) => variable.id === options?.contentVariableId,
  );
  const inputTypeVariableToUpdate =
    state.typebotsQueue[0].typebot.variables.find(
      (variable) => variable.id === options?.inputTypeVariableId,
    );
  const inputNameVariableToUpdate =
    state.typebotsQueue[0].typebot.variables.find(
      (variable) => variable.id === options?.inputNameVariableId,
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
    state,
    newVariables,
    currentBlockId: state.currentBlockId,
  });

  return {
    updatedState,
    newSetVariableHistory,
  };
};
