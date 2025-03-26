import type { ChoiceInputBlock } from "@typebot.io/blocks-inputs/choice/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import {
  getItemContent,
  matchByIndex,
  matchByKey,
  sortByContentLength,
} from "../../../helpers/choiceMatchers";
import type { ParsedReply } from "../../../types";
import { injectVariableValuesInButtonsInputBlock } from "./injectVariableValuesInButtonsInputBlock";

const parseMultipleChoiceReply = (
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

  if (matchedItems.length === 0) return { status: "fail" };

  return {
    status: "success",
    content: matchedItems
      .map((item) => getItemContent(item, ["value", "content"]))
      .join(", "),
  };
};

const parseSingleChoiceReply = (
  displayedItems: ChoiceInputBlock["items"],
  inputValue: string,
): ParsedReply => {
  const matchedItem = sortByContentLength(displayedItems).find(
    (item) =>
      item.id === inputValue ||
      (item.value && inputValue.trim() === item.value.trim()) ||
      (item.content && inputValue.trim() === item.content.trim()),
  );

  if (!matchedItem) return { status: "fail" };

  return {
    status: "success",
    content: getItemContent(matchedItem, ["value", "content"]),
    outgoingEdgeId: matchedItem.outgoingEdgeId,
  };
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
    ? parseMultipleChoiceReply(displayedItems, inputValue)
    : parseSingleChoiceReply(displayedItems, inputValue);
};
