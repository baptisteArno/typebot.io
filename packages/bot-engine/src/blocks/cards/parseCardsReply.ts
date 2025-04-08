import type {
  CardsBlock,
  CardsItem,
} from "@typebot.io/blocks-inputs/cards/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { isNotEmpty } from "@typebot.io/lib/utils";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import type { ParsedReply } from "../../types";
import { injectVariableValuesInCardsBlock } from "./injectVariableValuesInCardsBlock";

export const parseCardsReply = (
  inputValue: string,
  {
    block,
    state,
    sessionStore,
  }: {
    block: CardsBlock;
    state: SessionState;
    sessionStore: SessionStore;
  },
): ParsedReply => {
  const displayedItems = injectVariableValuesInCardsBlock(block, {
    variables: state.typebotsQueue[0].typebot.variables,
    sessionStore,
  }).items;
  let matchedPath: NonNullable<CardsItem["paths"]>[number] | undefined;
  const longestItemsFirst = [...displayedItems].sort(
    (a, b) => (b.title?.length ?? 0) - (a.title?.length ?? 0),
  );
  const matchedItem = longestItemsFirst.find((item) => {
    matchedPath = item.paths?.find((path) => path.id === inputValue);
    if (matchedPath) return true;
    return item.title?.toLowerCase().trim() === inputValue.toLowerCase().trim();
  });

  if (!matchedItem) return { status: "fail" };

  return {
    status: "success",
    content: isNotEmpty(matchedItem.title)
      ? matchedItem.title
      : (matchedItem.imageUrl ?? ""),
    outgoingEdgeId: matchedPath?.outgoingEdgeId,
  };
};
