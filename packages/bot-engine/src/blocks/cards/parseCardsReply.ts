import type {
  CardsBlock,
  CardsItem,
} from "@typebot.io/blocks-inputs/cards/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { isNotEmpty } from "@typebot.io/lib/utils";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import type {
  SetVariableHistoryItem,
  Variable,
} from "@typebot.io/variables/schemas";
import type { ParsedReply } from "../../types";
import { updateVariablesInSession } from "../../updateVariablesInSession";
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
): ParsedReply & {
  newSessionState?: SessionState;
  newSetVariableHistory?: SetVariableHistoryItem[];
} => {
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

  const variablesToUpdate = block.options?.saveResponseMapping?.reduce<
    Variable[]
  >((acc, mapping) => {
    if (!mapping.variableId || !mapping.field) return acc;
    const existingVariable = state.typebotsQueue[0].typebot.variables.find(
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

  let newSetVariableHistory: SetVariableHistoryItem[] = [];
  let newSessionState: SessionState = state;
  if (variablesToUpdate && variablesToUpdate.length > 0) {
    const { updatedState, newSetVariableHistory: updatedSetVariableHistory } =
      updateVariablesInSession({
        state,
        newVariables: variablesToUpdate,
        currentBlockId: block.id,
      });
    newSessionState = updatedState;
    if (updatedSetVariableHistory.length > 0)
      newSetVariableHistory = updatedSetVariableHistory;
  }

  return {
    status: "success",
    content: isNotEmpty(matchedItem.title)
      ? matchedItem.title
      : (matchedItem.imageUrl ?? ""),
    outgoingEdgeId: matchedPath?.outgoingEdgeId,
    newSessionState,
    newSetVariableHistory,
  };
};
