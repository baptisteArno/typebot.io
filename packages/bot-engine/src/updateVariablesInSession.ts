import type { SessionState } from "@typebot.io/chat-session/schemas";
import { safeStringify } from "@typebot.io/lib/safeStringify";
import type {
  SetVariableHistoryItem,
  Variable,
  VariableWithUnknowValue,
} from "@typebot.io/variables/schemas";

type Props = {
  state: SessionState;
  newVariables: VariableWithUnknowValue[];
  currentBlockId: string | undefined;
};
// TODO: Refacto newVariables param first, other in second
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
      ? variable.value.map((value) =>
          sanitizeNewVariableValue(safeStringify(value)),
        )
      : sanitizeNewVariableValue(safeStringify(variable.value)),
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

const sanitizeNewVariableValue = (value: string | null): string | null =>
  value ? sanitizeString(value) : null;

export const sanitizeString = (input: string): string => {
  // 1. Replace unpaired surrogate halves with �
  let output = input.replace(
    /([\uD800-\uDBFF](?![\uDC00-\uDFFF]))|((?<![\uD800-\uDBFF])[\uDC00-\uDFFF])/g,
    "�",
  );

  // 2. Escape lone backslashes that could break downstream JSON parsing
  output = output.replace(/\\(?![\\ntbrf"'u])/g, "\\\\");

  return output;
};
