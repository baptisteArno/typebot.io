import { parseGuessedValueType } from './parseGuessedValueType'
import { parseVariables } from './parseVariables'
import { Variable } from './types'

export const parseVariableNumber =
  (variables: Variable[]) =>
  (input: number | `{{${string}}}` | undefined): number | undefined => {
    if (typeof input === 'number' || input === undefined) return input
    const parsedInput = parseGuessedValueType(parseVariables(variables)(input))
    if (typeof parsedInput !== 'number') return undefined
    return parsedInput
  }
