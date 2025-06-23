import type { ChoiceInputBlock } from "@typebot.io/blocks-inputs/choice/schema";
import {
  getItemContent,
  sortByContentLength,
} from "../../../helpers/choiceMatchers";
import type { ParsedReply } from "../../../types";

export const parseSingleChoiceReply = (
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
