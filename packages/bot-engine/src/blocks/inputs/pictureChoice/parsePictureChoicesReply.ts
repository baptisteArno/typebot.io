import type { PictureChoiceBlock } from "@typebot.io/blocks-inputs/pictureChoice/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { isNotEmpty } from "@typebot.io/lib/utils";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import {
  matchByIndex,
  matchByKey,
  sortByContentLength,
} from "../../../helpers/choiceMatchers";
import type { ParsedReply } from "../../../types";
import { injectVariableValuesInPictureChoiceBlock } from "./injectVariableValuesInPictureChoiceBlock";

const handleMultipleChoice = (
  displayedItems: PictureChoiceBlock["items"],
  inputValue: string,
): ParsedReply => {
  const valueMatches = matchByKey({
    items: sortByContentLength(displayedItems, "value"),
    inputValue,
    key: "value",
  });

  const contentMatches = matchByKey({
    items: valueMatches.remaining,
    inputValue,
    key: "title",
  });

  const indexMatches = matchByIndex(contentMatches.remaining, {
    strippedInput: inputValue,
    matchedItemIds: contentMatches.matchedItemIds,
  });

  const matchedItems = displayedItems.filter((item) =>
    [
      ...valueMatches.matchedItemIds,
      ...contentMatches.matchedItemIds,
      ...indexMatches.matchedItemIds,
    ].includes(item.id),
  );

  if (matchedItems.length === 0) return { status: "fail" };
  const content = matchedItems
    .map((item) => {
      if (item.value) return item.value;
      if (isNotEmpty(item.title)) return item.title;
      return item.pictureSrc;
    })
    .join(", ");

  return {
    status: "success",
    content,
  };
};

const handleSingleChoice = (
  displayedItems: PictureChoiceBlock["items"],
  inputValue: string,
): ParsedReply => {
  const matchedItem = sortByContentLength(displayedItems).find(
    (item) =>
      item.id === inputValue ||
      item.value?.toLowerCase().trim() === inputValue.toLowerCase().trim() ||
      item.title?.toLowerCase().trim() === inputValue.toLowerCase().trim() ||
      item.pictureSrc?.toLowerCase().trim() === inputValue.toLowerCase().trim(),
  );

  if (!matchedItem) return { status: "fail" };

  const content = isNotEmpty(matchedItem?.title)
    ? matchedItem.title!
    : (matchedItem?.pictureSrc ?? "");

  return {
    status: "success",
    outgoingEdgeId: matchedItem.outgoingEdgeId,
    content: isNotEmpty(matchedItem.value) ? matchedItem.value : content,
  };
};

export const parsePictureChoicesReply = (
  inputValue: string,
  {
    block,
    state,
    sessionStore,
  }: {
    block: PictureChoiceBlock;
    state: SessionState;
    sessionStore: SessionStore;
  },
): ParsedReply => {
  const displayedItems = injectVariableValuesInPictureChoiceBlock(block, {
    variables: state.typebotsQueue[0].typebot.variables,
    sessionStore,
  }).items;

  return block.options?.isMultipleChoice
    ? handleMultipleChoice(displayedItems, inputValue)
    : handleSingleChoice(displayedItems, inputValue);
};
