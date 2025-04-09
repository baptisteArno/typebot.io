import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import { defaultChoiceInputOptions } from "@typebot.io/blocks-inputs/choice/constants";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { defaultPictureChoiceOptions } from "@typebot.io/blocks-inputs/pictureChoice/constants";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import type { SkipReply, SuccessReply } from "./types";

export const getOutgoingEdgeId = (
  reply: SuccessReply | SkipReply | undefined,
  {
    block,
    state,
    sessionStore,
  }: {
    block: Block;
    state: SessionState;
    sessionStore: SessionStore;
  },
): { edgeId: string | undefined; isOffDefaultPath: boolean } => {
  if (!reply || reply.status === "skip")
    return { edgeId: block.outgoingEdgeId, isOffDefaultPath: false };
  if (reply.outgoingEdgeId)
    return { edgeId: reply.outgoingEdgeId, isOffDefaultPath: true };
  const variables = state.typebotsQueue[0].typebot.variables;
  if (
    block.type === InputBlockType.CHOICE &&
    !(
      block.options?.isMultipleChoice ??
      defaultChoiceInputOptions.isMultipleChoice
    ) &&
    reply
  ) {
    const matchedItem = block.items.find(
      (item) =>
        parseVariables(item.content, {
          variables,
          sessionStore,
        }).normalize() === reply.content.normalize(),
    );
    if (matchedItem?.outgoingEdgeId)
      return { edgeId: matchedItem.outgoingEdgeId, isOffDefaultPath: true };
  }
  if (
    block.type === InputBlockType.PICTURE_CHOICE &&
    !(
      block.options?.isMultipleChoice ??
      defaultPictureChoiceOptions.isMultipleChoice
    ) &&
    reply
  ) {
    const matchedItem = block.items.find(
      (item) =>
        parseVariables(item.title, { variables, sessionStore }).normalize() ===
        reply.content.normalize(),
    );
    if (matchedItem?.outgoingEdgeId)
      return { edgeId: matchedItem.outgoingEdgeId, isOffDefaultPath: true };
  }
  return { edgeId: block.outgoingEdgeId, isOffDefaultPath: false };
};
