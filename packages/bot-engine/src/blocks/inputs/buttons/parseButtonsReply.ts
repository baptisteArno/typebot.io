import type { ChoiceInputBlock } from "@typebot.io/blocks-inputs/choice/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import {
  matchByIndex,
  matchByKey,
  sortByContentLength,
} from "../../../helpers/choiceMatchers";
import type { ParsedReply } from "../../../types";
import { injectVariableValuesInButtonsInputBlock } from "./injectVariableValuesInButtonsInputBlock";

const createMatchedItemsResponse = (
  matchedItems: ChoiceInputBlock["items"],
  isSingleChoice = false,
): ParsedReply => {
  if (matchedItems.length === 0) return { status: "fail" };

  const firstItem = matchedItems[0];

  return {
    status: "success",
    content: isSingleChoice
      ? (firstItem.value ?? firstItem.content ?? "")
      : matchedItems.map((item) => item.value ?? item.content).join(", "),
    ...(isSingleChoice && { outgoingEdgeId: firstItem.outgoingEdgeId }),
  };
};

const handleMultipleChoice = (
  displayedItems: ChoiceInputBlock["items"],
  inputValue: string,
): ParsedReply => {
  const valueMatches = matchByKey({
    items: sortByContentLength(displayedItems),
    inputValue,
    key: "value",
  });

  const contentMatches = matchByKey({
    items: valueMatches.remaining,
    inputValue,
    key: "content",
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

  return createMatchedItemsResponse(matchedItems);
};

const handleSingleChoice = (
  displayedItems: ChoiceInputBlock["items"],
  inputValue: string,
): ParsedReply => {
  const matchedItem = sortByContentLength(displayedItems).find(
    (item) =>
      item.id === inputValue ||
      (item.value && inputValue.trim() === item.value.trim()) ||
      (item.content && inputValue.trim() === item.content.trim()),
  );

  return createMatchedItemsResponse(matchedItem ? [matchedItem] : [], true);
};

export const parseButtonsReply = (
  inputValue: string,
  {
    block,
    state,
    sessionStore,
  }: {
    block: ChoiceInputBlock;
    state: SessionState;
    sessionStore: SessionStore;
  },
): ParsedReply => {
  const displayedItems = injectVariableValuesInButtonsInputBlock(block, {
    state,
    sessionStore,
  }).items;

  return block.options?.isMultipleChoice
    ? handleMultipleChoice(displayedItems, inputValue)
    : handleSingleChoice(displayedItems, inputValue);
};
