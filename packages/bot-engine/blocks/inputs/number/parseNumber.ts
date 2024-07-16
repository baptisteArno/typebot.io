export const parseNumber = (value: string) => {
  if (value.startsWith('0')) return value
  return parseFloat(value).toString()
}
