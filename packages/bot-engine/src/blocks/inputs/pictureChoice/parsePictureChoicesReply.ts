import type { PictureChoiceBlock } from "@typebot.io/blocks-inputs/pictureChoice/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import {
  getItemContent,
  matchByIndex,
  matchByKey,
  sortByContentLength,
} from "../../../helpers/choiceMatchers";
import type { ParsedReply } from "../../../types";
import { injectVariableValuesInPictureChoiceBlock } from "./injectVariableValuesInPictureChoiceBlock";

const parseMultipleChoiceReply = (
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
    .map((item) => getItemContent(item, ["value", "title", "pictureSrc"]))
    .join(", ");

  return {
    status: "success",
    content,
  };
};

const parseSingleChoiceReply = (
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

  return {
    status: "success",
    outgoingEdgeId: matchedItem.outgoingEdgeId,
    content: getItemContent(matchedItem, ["value", "title", "pictureSrc"]),
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
    ? parseMultipleChoiceReply(displayedItems, inputValue)
    : parseSingleChoiceReply(displayedItems, inputValue);
};
