import { safeStringify } from '@sniper.io/lib/safeStringify'
import { Variable, VariableWithUnknowValue } from './types'
import { SessionState, SetVariableHistoryItem } from '../schemas'

type Props = {
  state: SessionState
  newVariables: VariableWithUnknowValue[]
  currentBlockId: string | undefined
}
export const updateVariablesInSession = ({
  state,
  newVariables,
  currentBlockId,
}: Props): {
  updatedState: SessionState
  newSetVariableHistory: SetVariableHistoryItem[]
} => {
  const { updatedVariables, newSetVariableHistory, setVariableHistoryIndex } =
    updateSniperVariables({
      state,
      newVariables,
      currentBlockId,
    })

  return {
    updatedState: {
      ...state,
      currentSetVariableHistoryIndex: setVariableHistoryIndex,
      snipersQueue: state.snipersQueue.map((sniperInQueue, index: number) =>
        index === 0
          ? {
              ...sniperInQueue,
              sniper: {
                ...sniperInQueue.sniper,
                variables: updatedVariables,
              },
            }
          : sniperInQueue
      ),
      previewMetadata: state.snipersQueue[0].resultId
        ? state.previewMetadata
        : {
            ...state.previewMetadata,
            setVariableHistory: (
              state.previewMetadata?.setVariableHistory ?? []
            ).concat(newSetVariableHistory),
          },
    },
    newSetVariableHistory,
  }
}

const updateSniperVariables = ({
  state,
  newVariables,
  currentBlockId,
}: {
  state: SessionState
  newVariables: VariableWithUnknowValue[]
  currentBlockId: string | undefined
}): {
  updatedVariables: Variable[]
  newSetVariableHistory: SetVariableHistoryItem[]
  setVariableHistoryIndex: number
} => {
  const serializedNewVariables = newVariables.map((variable) => ({
    ...variable,
    value: Array.isArray(variable.value)
      ? variable.value.map(safeStringify)
      : safeStringify(variable.value),
  }))

  let setVariableHistoryIndex = state.currentSetVariableHistoryIndex ?? 0
  const setVariableHistory: SetVariableHistoryItem[] = []
  if (currentBlockId) {
    serializedNewVariables
      .filter((v) => state.setVariableIdsForHistory?.includes(v.id))
      .forEach((newVariable) => {
        setVariableHistory.push({
          resultId: state.snipersQueue[0].resultId as string,
          index: setVariableHistoryIndex,
          blockId: currentBlockId,
          variableId: newVariable.id,
          value: newVariable.value,
        })
        setVariableHistoryIndex += 1
      })
  }

  return {
    updatedVariables: [
      ...state.snipersQueue[0].sniper.variables.filter((existingVariable) =>
        serializedNewVariables.every(
          (newVariable) => existingVariable.id !== newVariable.id
        )
      ),
      ...serializedNewVariables,
    ],
    newSetVariableHistory: setVariableHistory,
    setVariableHistoryIndex,
  }
}
