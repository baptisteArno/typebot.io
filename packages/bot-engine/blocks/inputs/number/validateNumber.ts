import { isNotDefined } from '@sniper.io/lib'
import { NumberInputBlock, Variable } from '@sniper.io/schemas'
import { parseVariables } from '@sniper.io/variables/parseVariables'

export const validateNumber = (
  inputValue: string,
  {
    options,
    variables,
  }: {
    options: NumberInputBlock['options']
    variables: Variable[]
  }
) => {
  const min =
    options?.min && typeof options.min === 'string'
      ? Number(parseVariables(variables)(options.min))
      : undefined
  const max =
    options?.min && typeof options.min === 'string'
      ? Number(parseVariables(variables)(options.min))
      : undefined

  return (
    inputValue !== '' &&
    (isNotDefined(min) || Number(inputValue) >= min) &&
    (isNotDefined(max) || Number(inputValue) <= max)
  )
}
