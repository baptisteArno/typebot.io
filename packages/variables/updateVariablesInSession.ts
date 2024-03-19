import { safeStringify } from '@typebot.io/lib/safeStringify'
import { Variable, VariableWithUnknowValue } from './types'

export const updateVariablesInSession =
  (state: any) => (newVariables: VariableWithUnknowValue[]) => ({
    ...state,
    typebotsQueue: state.typebotsQueue.map(
      (typebotInQueue: { typebot: { variables: Variable[] } }, index: number) =>
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
