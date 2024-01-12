export const parseUniqueKey = (
  key: string,
  existingKeys: string[],
  count = 0
): string => {
  if (!existingKeys.includes(key)) return key
  return parseUniqueKey(`${key} (${count + 1})`, existingKeys, count + 1)
}
