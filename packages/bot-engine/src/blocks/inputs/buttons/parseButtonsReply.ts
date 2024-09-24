import type { ChoiceInputBlock } from "@typebot.io/blocks-inputs/choice/schema";
import type { SessionState } from "../../../schemas/chatSession";
import type { ParsedReply } from "../../../types";
import { injectVariableValuesInButtonsInputBlock } from "./injectVariableValuesInButtonsInputBlock";

export const parseButtonsReply =
  (state: SessionState) =>
  (inputValue: string, block: ChoiceInputBlock): ParsedReply => {
    const displayedItems =
      injectVariableValuesInButtonsInputBlock(state)(block).items;
    if (block.options?.isMultipleChoice) {
      const longestItemsFirst = [...displayedItems].sort(
        (a, b) => (b.content?.length ?? 0) - (a.content?.length ?? 0),
      );
      const matchedItemsByContent = longestItemsFirst.reduce<{
        strippedInput: string;
        matchedItemIds: string[];
      }>(
        (acc, item) => {
          if (
            item.content &&
            acc.strippedInput
              .toLowerCase()
              .includes(item.content.trim().toLowerCase())
          )
            return {
              strippedInput: acc.strippedInput.replace(item.content ?? "", ""),
              matchedItemIds: [...acc.matchedItemIds, item.id],
            };
          return acc;
        },
        {
          strippedInput: inputValue.trim(),
          matchedItemIds: [],
        },
      );
      const remainingItems = displayedItems.filter(
        (item) => !matchedItemsByContent.matchedItemIds.includes(item.id),
      );
      const matchedItemsByIndex = remainingItems.reduce<{
        strippedInput: string;
        matchedItemIds: string[];
      }>(
        (acc, item, idx) => {
          if (acc.strippedInput.includes(`${idx + 1}`))
            return {
              strippedInput: acc.strippedInput.replace(`${idx + 1}`, ""),
              matchedItemIds: [...acc.matchedItemIds, item.id],
            };
          return acc;
        },
        {
          strippedInput: matchedItemsByContent.strippedInput,
          matchedItemIds: [],
        },
      );
      const matchedItems = displayedItems.filter((item) =>
        [
          ...matchedItemsByContent.matchedItemIds,
          ...matchedItemsByIndex.matchedItemIds,
        ].includes(item.id),
      );
      if (matchedItems.length === 0) return { status: "fail" };
      return {
        status: "success",
        reply: matchedItems.map((item) => item.content).join(", "),
      };
    }
    const longestItemsFirst = [...displayedItems].sort(
      (a, b) => (b.content?.length ?? 0) - (a.content?.length ?? 0),
    );
    const matchedItem = longestItemsFirst.find(
      (item) =>
        item.id === inputValue ||
        (item.content && inputValue.trim() === item.content.trim()),
    );
    if (!matchedItem) return { status: "fail" };
    return {
      status: "success",
      reply: matchedItem.content ?? "",
    };
  };
