import type {
  CardsBlock,
  CardsItem,
} from "@typebot.io/blocks-inputs/cards/schema";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import type { Variable } from "@typebot.io/variables/schemas";
import type { ParsedReply } from "../../types";
import { injectVariableValuesInCardsBlock } from "./injectVariableValuesInCardsBlock";

export const parseCardsReply = (
  inputValue: string,
  {
    block,
    variables,
    sessionStore,
    replyId,
  }: {
    block: CardsBlock;
    variables: Variable[];
    sessionStore: SessionStore;
    replyId: string | undefined;
  },
): ParsedReply => {
  const displayedItems = injectVariableValuesInCardsBlock(block, {
    variables,
    sessionStore,
  }).items;
  let matchedPath: NonNullable<CardsItem["paths"]>[number] | undefined;
  const longestItemsFirst = [...displayedItems].sort(
    (a, b) => (b.title?.length ?? 0) - (a.title?.length ?? 0),
  );
  const matchedItem = longestItemsFirst.find((item) => {
    matchedPath = item.paths?.find(
      (path) => path.id === inputValue || (replyId && path.id === replyId),
    );
    if (matchedPath) return true;
    return item.title?.toLowerCase().trim() === inputValue.toLowerCase().trim();
  });

  // Limitation. If no path is matched, we default to the first path. Should only happen when computing result transcript.
  if (!matchedPath) matchedPath = matchedItem?.paths?.[0];

  if (!matchedItem) return { status: "fail" };

  const variablesToUpdate = block.options?.saveResponseMapping?.reduce<
    Variable[]
  >((acc, mapping) => {
    if (!mapping.variableId || !mapping.field) return acc;
    const existingVariable = variables.find(
      (variable) => variable.id === mapping.variableId,
    );
    if (!existingVariable) return acc;
    let value;
    if (mapping.field === "Image URL") {
      value = matchedItem.imageUrl;
    }
    if (mapping.field === "Title") {
      value = matchedItem.title;
    }
    if (mapping.field === "Description") {
      value = matchedItem.description;
    }
    if (mapping.field === "Button") {
      value = matchedPath?.text;
    }
    if (
      mapping.field === "Internal Value" &&
      matchedItem.options?.internalValue
    ) {
      value = matchedItem.options.internalValue;
    }
    acc.push({
      ...existingVariable,
      value,
    });
    return acc;
  }, []);

  const content = matchedItem.title || matchedItem.imageUrl;
  if (!content) return { status: "fail" };

  return {
    status: "success",
    content,
    outgoingEdgeId: matchedPath?.outgoingEdgeId,
    variablesToUpdate,
  };
};
