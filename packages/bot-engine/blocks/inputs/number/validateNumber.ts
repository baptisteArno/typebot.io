import { isNotDefined } from '@typebot.io/lib'
import { NumberInputBlock, Variable } from '@typebot.io/schemas'
import { parseVariables } from '@typebot.io/variables/parseVariables'

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
