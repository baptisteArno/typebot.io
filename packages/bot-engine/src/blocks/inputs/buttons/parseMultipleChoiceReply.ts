import type { ChoiceInputBlock } from "@typebot.io/blocks-inputs/choice/schema";
import { sortByContentLength } from "../../../helpers/choiceMatchers";
import type { ParsedReply } from "../../../types";

/**
 * Parses a multiple choice reply from a user.
 * It checks for matches by internal value, content, index or ID. And returns the parsed reply with the content of all matched items.
 */
export const parseMultipleChoiceReply = (
  reply: string,
  { items }: { items: ChoiceInputBlock["items"] },
): ParsedReply => {
  let remainingInput = reply;
  const remainingItems = sortByContentLength(items);
  // We match the IDs first and then filter through the items to have an order independent result
  const matchedItemIds: string[] = [];

  // Match by ID
  for (const item of remainingItems) {
    if (item.id && matchIsolatedWord(remainingInput, item.id)) {
      remainingInput = remainingInput.replace(item.id, "").trim();
      matchedItemIds.push(item.id);
      remainingItems.splice(remainingItems.indexOf(item), 1);
    }
  }

  // Match by internal value
  for (const item of remainingItems) {
    if (item.value && matchIsolatedWord(remainingInput, item.value)) {
      remainingInput = remainingInput.replace(item.value, "").trim();
      matchedItemIds.push(item.id);
      remainingItems.splice(remainingItems.indexOf(item), 1);
    }
  }

  // Match by content
  for (const item of remainingItems) {
    if (item.content && matchIsolatedWord(remainingInput, item.content)) {
      remainingInput = remainingInput.replace(item.content, "").trim();
      matchedItemIds.push(item.id);
      remainingItems.splice(remainingItems.indexOf(item), 1);
    }
  }

  // Match by index
  for (const [idx, item] of items.entries()) {
    console.log(
      item,
      idx,
      matchIsolatedWord(remainingInput, `${idx + 1}`),
      item,
      remainingItems,
    );
    if (
      matchIsolatedWord(remainingInput, `${idx + 1}`) &&
      remainingItems.some(({ id }) => id === item.id)
    ) {
      remainingInput = remainingInput.replace(`${idx + 1}`, "").trim();
      matchedItemIds.push(item.id);
      remainingItems.splice(remainingItems.indexOf(item), 1);
    }
  }

  if (matchedItemIds.length === 0) return { status: "fail" };

  return {
    status: "success",
    content: items
      .filter((item) => matchedItemIds.includes(item.id))
      .map((item) => item.value ?? item.content)
      .join(", "),
  };
};

/**
 * Matches a word that is not part of a longer word.
 */
const matchIsolatedWord = (input: string, word: string) =>
  new RegExp(`\\b${word}\\b`).test(input);
