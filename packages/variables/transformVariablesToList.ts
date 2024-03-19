import { isNotDefined } from '@typebot.io/lib/utils'
import { Variable, VariableWithValue } from './types'

export const transformVariablesToList =
  (variables: Variable[]) =>
  (variableIds: string[]): VariableWithValue[] => {
    const newVariables = variables.reduce<VariableWithValue[]>(
      (variables, variable) => {
        if (
          !variableIds.includes(variable.id) ||
          isNotDefined(variable.value) ||
          typeof variable.value !== 'string'
        )
          return variables
        return [
          ...variables,
          {
            ...variable,
            value: [variable.value],
          },
        ]
      },
      []
    )
    return newVariables
  }
