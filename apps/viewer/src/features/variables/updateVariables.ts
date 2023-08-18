import { isDefined } from '@typebot.io/lib'
import {
  SessionState,
  VariableWithUnknowValue,
  VariableWithValue,
  Variable,
} from '@typebot.io/schemas'
import { safeStringify } from '@typebot.io/lib/safeStringify'

export const updateVariables =
  (state: SessionState) =>
  (newVariables: VariableWithUnknowValue[]): SessionState => ({
    ...state,
    typebot: {
      ...state.typebot,
      variables: updateTypebotVariables(state)(newVariables),
    },
    result: {
      ...state.result,
      variables: updateResultVariables(state)(newVariables),
    },
  })

const updateResultVariables =
  ({ result }: Pick<SessionState, 'result' | 'typebot'>) =>
  (newVariables: VariableWithUnknowValue[]): VariableWithValue[] => {
    const serializedNewVariables = newVariables.map((variable) => ({
      ...variable,
      value: Array.isArray(variable.value)
        ? variable.value.map(safeStringify)
        : safeStringify(variable.value),
    }))

    const updatedVariables = [
      ...result.variables.filter((existingVariable) =>
        serializedNewVariables.every(
          (newVariable) => existingVariable.id !== newVariable.id
        )
      ),
      ...serializedNewVariables,
    ].filter((variable) => isDefined(variable.value)) as VariableWithValue[]

    return updatedVariables
  }

const updateTypebotVariables =
  ({ typebot }: Pick<SessionState, 'result' | 'typebot'>) =>
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
