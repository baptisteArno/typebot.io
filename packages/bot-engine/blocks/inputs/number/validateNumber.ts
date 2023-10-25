import { isNotDefined } from '@typebot.io/lib'
import { NumberInputBlock } from '@typebot.io/schemas'

export const validateNumber = (
  inputValue: string,
  options: NumberInputBlock['options']
) =>
  inputValue !== '' &&
  (isNotDefined(options?.min) || Number(inputValue) >= Number(options.min)) &&
  (isNotDefined(options?.max) || Number(inputValue) <= Number(options.max))
