import { isDefined } from '@typebot.io/lib'
import { Variable, VariableWithValue } from '../schemas'

export const filterVariablesWithValues = (
  variables: Variable[]
): VariableWithValue[] =>
  variables.filter((variable) =>
    isDefined(variable.value)
  ) as VariableWithValue[]
