import { Variable } from '@typebot.io/schemas'

export const parseGuessedValueType = (
  value: Variable['value']
): string | (string | null)[] | boolean | number | null | undefined => {
  if (value === null) return null
  if (value === undefined) return undefined
  if (typeof value !== 'string') return value
  const isStartingWithZero =
    value.startsWith('0') && !value.startsWith('0.') && value.length > 1
  if (typeof value === 'string' && isStartingWithZero) return value
  const isStartingWithPlus = value.startsWith('+')
  if (typeof value === 'string' && isStartingWithPlus) return value
  if (typeof value === 'number') return value
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === 'null') return null
  if (value === 'undefined') return undefined
  // isNaN works with strings
  if (isNaN(value as unknown as number)) return value
  return Number(value)
}
