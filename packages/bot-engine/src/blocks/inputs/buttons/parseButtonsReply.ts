import type { ChoiceInputBlock } from "@typebot.io/blocks-inputs/choice/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import type { ParsedReply } from "../../../types";
import { injectVariableValuesInButtonsInputBlock } from "./injectVariableValuesInButtonsInputBlock";

type MatchResult = {
  strippedInput: string;
  matchedItemIds: string[];
};

type MatchContext = {
  items: ChoiceInputBlock["items"];
  inputValue: string;
};

type MatchFunction = (
  item: ChoiceInputBlock["items"][0],
  input: string,
  idx?: number,
) => boolean;

const sortByContentLength = (items: ChoiceInputBlock["items"]) =>
  [...items].sort(
    (a, b) => (b.content?.length ?? 0) - (a.content?.length ?? 0),
  );

const createMatchReducer =
  (matchFn: MatchFunction) =>
  (acc: MatchResult, item: ChoiceInputBlock["items"][0], idx?: number) => {
    const input = acc.strippedInput;
    if (matchFn(item, input)) {
      const matchValue = item.content ?? item.value ?? `${idx! + 1}`;
      return {
        strippedInput: acc.strippedInput.replace(matchValue, ""),
        matchedItemIds: [...acc.matchedItemIds, item.id],
      };
    }
    return acc;
  };

const matchByContent = ({ items, inputValue }: MatchContext): MatchResult => {
  const matchFn: MatchFunction = (item, input) =>
    Boolean(
      item.content &&
        input.toLowerCase().includes(item.content.trim().toLowerCase()),
    );

  return items.reduce(createMatchReducer(matchFn), {
    strippedInput: inputValue.trim(),
    matchedItemIds: [],
  });
};

const matchByValue = (
  remainingItems: ChoiceInputBlock["items"],
  { strippedInput }: MatchResult,
): MatchResult => {
  const matchFn: MatchFunction = (item, input) =>
    Boolean(item.value && input.trim() === item.value.trim());

  return remainingItems.reduce(createMatchReducer(matchFn), {
    strippedInput,
    matchedItemIds: [],
  });
};

const matchByIndex = (
  remainingItems: ChoiceInputBlock["items"],
  { strippedInput }: MatchResult,
): MatchResult => {
  const matchFn: MatchFunction = (item, input, idx) =>
    input.includes(`${idx! + 1}`);

  return remainingItems.reduce(createMatchReducer(matchFn), {
    strippedInput,
    matchedItemIds: [],
  });
};

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
  const contentMatch = matchByContent({
    items: sortByContentLength(displayedItems),
    inputValue,
  });

  let remainingItems = displayedItems.filter(
    (item) => !contentMatch.matchedItemIds.includes(item.id),
  );

  const valueMatch = matchByValue(remainingItems, contentMatch);
  remainingItems = remainingItems.filter(
    (item) => !valueMatch.matchedItemIds.includes(item.id),
  );

  const indexMatch = matchByIndex(remainingItems, contentMatch);

  const matchedItems = displayedItems.filter((item) =>
    [
      ...contentMatch.matchedItemIds,
      ...valueMatch.matchedItemIds,
      ...indexMatch.matchedItemIds,
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
