import { isDefined } from '@typebot.io/lib'
import { Variable, VariableWithValue } from '../schemas'

export const filterNonSessionVariablesWithValues = (
  variables: Variable[]
): VariableWithValue[] =>
  variables.filter(
    (variable) => isDefined(variable.value) && !variable.isSessionVariable
  ) as VariableWithValue[]
