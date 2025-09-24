import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import { defaultChoiceInputOptions } from "@typebot.io/blocks-inputs/choice/constants";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { defaultPictureChoiceOptions } from "@typebot.io/blocks-inputs/pictureChoice/constants";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import type { Variable } from "@typebot.io/variables/schemas";
import type { SkipReply, SuccessReply } from "./types";

export const getReplyOutgoingEdge = (
  reply: SuccessReply | SkipReply | undefined,
  {
    block,
    variables,
    sessionStore,
  }: {
    block: Block;
    variables: Variable[];
    sessionStore: SessionStore;
  },
): { id: string; isOffDefaultPath: boolean } | undefined => {
  if (!reply || reply.status === "skip")
    return block.outgoingEdgeId
      ? { id: block.outgoingEdgeId, isOffDefaultPath: false }
      : undefined;
  if (reply.outgoingEdgeId)
    return { id: reply.outgoingEdgeId, isOffDefaultPath: true };
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
      return { id: matchedItem.outgoingEdgeId, isOffDefaultPath: true };
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
      return { id: matchedItem.outgoingEdgeId, isOffDefaultPath: true };
  }
  return block.outgoingEdgeId
    ? { id: block.outgoingEdgeId, isOffDefaultPath: false }
    : undefined;
};
