import { safeStringify } from "@typebot.io/lib/safeStringify";
import type {
  SetVariableHistoryItem,
  Variable,
  VariableWithUnknowValue,
} from "@typebot.io/variables/schemas";
import type { SessionState } from "./schemas/chatSession";

type Props = {
  state: SessionState;
  newVariables: VariableWithUnknowValue[];
  currentBlockId: string | undefined;
};
export const updateVariablesInSession = ({
  state,
  newVariables,
  currentBlockId,
}: Props): {
  updatedState: SessionState;
  newSetVariableHistory: SetVariableHistoryItem[];
} => {
  const { updatedVariables, newSetVariableHistory, setVariableHistoryIndex } =
    updateTypebotVariables({
      state,
      newVariables,
      currentBlockId,
    });

  return {
    updatedState: {
      ...state,
      currentSetVariableHistoryIndex: setVariableHistoryIndex,
      typebotsQueue: state.typebotsQueue.map((typebotInQueue, index: number) =>
        index === 0
          ? {
              ...typebotInQueue,
              typebot: {
                ...typebotInQueue.typebot,
                variables: updatedVariables,
              },
            }
          : typebotInQueue,
      ),
      previewMetadata: state.typebotsQueue[0]!.resultId
        ? state.previewMetadata
        : {
            ...state.previewMetadata,
            setVariableHistory: (
              state.previewMetadata?.setVariableHistory ?? []
            ).concat(newSetVariableHistory),
          },
    },
    newSetVariableHistory,
  };
};

const updateTypebotVariables = ({
  state,
  newVariables,
  currentBlockId,
}: {
  state: SessionState;
  newVariables: VariableWithUnknowValue[];
  currentBlockId: string | undefined;
}): {
  updatedVariables: Variable[];
  newSetVariableHistory: SetVariableHistoryItem[];
  setVariableHistoryIndex: number;
} => {
  const serializedNewVariables = newVariables.map((variable) => ({
    ...variable,
    value: Array.isArray(variable.value)
      ? variable.value.map(safeStringify)
      : safeStringify(variable.value),
  }));

  let setVariableHistoryIndex = state.currentSetVariableHistoryIndex ?? 0;
  const setVariableHistory: SetVariableHistoryItem[] = [];
  if (currentBlockId) {
    serializedNewVariables
      .filter((v) => state.setVariableIdsForHistory?.includes(v.id))
      .forEach((newVariable) => {
        setVariableHistory.push({
          resultId: state.typebotsQueue[0]!.resultId as string,
          index: setVariableHistoryIndex,
          blockId: currentBlockId,
          variableId: newVariable.id,
          value: newVariable.value,
        });
        setVariableHistoryIndex += 1;
      });
  }

  return {
    updatedVariables: [
      ...state.typebotsQueue[0]!.typebot.variables.filter(
        (existingVariable: { id: string }) =>
          serializedNewVariables.every(
            (newVariable) => existingVariable.id !== newVariable.id,
          ),
      ),
      ...serializedNewVariables,
    ],
    newSetVariableHistory: setVariableHistory,
    setVariableHistoryIndex,
  };
};
