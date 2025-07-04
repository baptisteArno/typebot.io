import type { ChoiceInputBlock } from "@typebot.io/blocks-inputs/choice/schema";
import { sortByContentLengthDesc } from "../../../helpers/choiceMatchers";
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
  const remainingItems = sortByContentLengthDesc(items);
  // We match the IDs first and then filter through the items to have an order independent result
  const matchedItemIds: string[] = [];

  // Match by ID
  for (const item of remainingItems) {
    if (item.id && includesWholePhrase(remainingInput, item.id)) {
      remainingInput = remainingInput.replace(item.id, "").trim();
      matchedItemIds.push(item.id);
    }
  }

  // Match by internal value
  for (const item of remainingItems.filter(
    (item) => !matchedItemIds.includes(item.id),
  ))
    if (item.value && includesWholePhrase(remainingInput, item.value)) {
      remainingInput = remainingInput.replace(item.value, "").trim();
      matchedItemIds.push(item.id);
    }

  // Match by content
  for (const item of remainingItems.filter(
    (item) => !matchedItemIds.includes(item.id),
  )) {
    if (item.content && includesWholePhrase(remainingInput, item.content)) {
      remainingInput = remainingInput.replace(item.content, "").trim();
      matchedItemIds.push(item.id);
      remainingItems.splice(remainingItems.indexOf(item), 1);
    }
  }

  // Match by index
  for (const [idx, item] of items.entries()) {
    if (
      includesWholePhrase(remainingInput, `${idx + 1}`) &&
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
      .map((item) => (item.value ?? item.content)?.trim())
      .join(", "),
  };
};

/**
 * Test whether `phrase` appears in `text` as a **stand-alone sequence of words**.
 */
const includesWholePhrase = (text: string, phrase: string) => {
  if (!phrase || !text) return false;

  // Normalise: trim ends and split on whitespace, removing empties.
  const words = phrase.trim().split(/\s+/u).filter(Boolean);
  if (!words.length) return false;

  // Escape any regex metacharacters the caller may have put in `phrase`.
  const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  const inner = escaped.join("\\s+");

  // Unicode “word” characters = Letter | Number | Mark
  const boundary = "[^\\p{L}\\p{N}\\p{M}]";

  // (^|boundary)  inner  (?=$|boundary)
  const pattern = `(?:^|${boundary})${inner}(?=$|${boundary})`;

  return new RegExp(pattern, "ui").test(text);
};
