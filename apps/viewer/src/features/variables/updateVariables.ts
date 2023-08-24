import {
  SessionState,
  VariableWithUnknowValue,
  Variable,
} from '@typebot.io/schemas'
import { safeStringify } from '@typebot.io/lib/safeStringify'

export const updateVariables =
  (state: SessionState) =>
  (newVariables: VariableWithUnknowValue[]): SessionState => ({
    ...state,
    typebotsQueue: state.typebotsQueue.map((typebotInQueue, index) =>
      index === 0
        ? {
            ...typebotInQueue,
            typebot: {
              ...typebotInQueue.typebot,
              variables: updateTypebotVariables(typebotInQueue.typebot)(
                newVariables
              ),
            },
          }
        : typebotInQueue
    ),
  })

const updateTypebotVariables =
  (typebot: { variables: Variable[] }) =>
  (newVariables: VariableWithUnknowValue[]): Variable[] => {
    const serializedNewVariables = newVariables.map((variable) => ({
      ...variable,
      value: Array.isArray(variable.value)
        ? variable.value.map(safeStringify)
        : safeStringify(variable.value),
    }))

    return [
      ...typebot.variables.filter((existingVariable) =>
        serializedNewVariables.every(
          (newVariable) => existingVariable.id !== newVariable.id
        )
      ),
      ...serializedNewVariables,
    ]
  }
