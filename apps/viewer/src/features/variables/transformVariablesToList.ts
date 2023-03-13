import { Variable, VariableWithValue } from 'models'
import { isNotDefined } from 'utils'

export const transformStringVariablesToList =
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
