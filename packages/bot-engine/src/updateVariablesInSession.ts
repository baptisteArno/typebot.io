import type { SessionState } from "@typebot.io/chat-session/schemas";
import { safeStringify } from "@typebot.io/lib/safeStringify";
import type {
  SetVariableHistoryItem,
  Variable,
  VariableWithUnknowValue,
} from "@typebot.io/variables/schemas";
import type { InputMessage } from "./schemas/api";

type Props = {
  state: SessionState;
  newVariables: VariableWithUnknowValue[];
  currentBlockId: string | undefined;
};

type UpdateInputVarProps = {
  state: SessionState;
  foundVariable: Variable;
  reply: InputMessage;
};

export const updateInputVariablesInSession = (params: UpdateInputVarProps) => {
  let newSessionState = updateAttachmentVariablesInSession(params);
  newSessionState = updateAudioVariablesInSession({
    ...params,
    state: newSessionState,
  });
  return updateTextVariablesInSession({ ...params, state: newSessionState });
};

export const updateAttachmentVariablesInSession = ({
  state,
  foundVariable,
  reply,
}: UpdateInputVarProps) => {
  if (
    reply.type !== "text" ||
    !reply.attachedFileUrls ||
    reply.attachedFileUrls.length === 0 ||
    !foundVariable
  )
    return state;

  const { updatedState } = updateVariablesInSession({
    newVariables: [
      {
        id: foundVariable.id,
        name: foundVariable.name,
        value: Array.isArray(foundVariable.value)
          ? foundVariable.value.concat(reply.attachedFileUrls)
          : reply.attachedFileUrls.length === 1
            ? reply.attachedFileUrls[0]
            : reply.attachedFileUrls,
      },
    ],
    currentBlockId: undefined,
    state,
  });

  return updatedState;
};

export const updateAudioVariablesInSession = ({
  state,
  foundVariable,
  reply,
}: UpdateInputVarProps) => {
  if (reply.type !== "audio" || !foundVariable) return state;

  const { updatedState } = updateVariablesInSession({
    newVariables: [
      {
        id: foundVariable.id,
        name: foundVariable.name,
        value: reply.url,
      },
    ],
    currentBlockId: undefined,
    state,
  });

  return updatedState;
};

export const updateTextVariablesInSession = ({
  state,
  foundVariable,
  reply,
}: UpdateInputVarProps) => {
  if (reply.type !== "text" || !foundVariable) return state;

  const { updatedState } = updateVariablesInSession({
    newVariables: [
      {
        ...foundVariable,
        value:
          Array.isArray(foundVariable.value) && reply.text
            ? foundVariable.value.concat(reply.text)
            : reply.text,
      },
    ],
    currentBlockId: undefined,
    state,
  });

  return updatedState;
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
