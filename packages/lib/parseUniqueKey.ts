export const parseUniqueKey = (key: string, existingKeys: string[]): string => {
  const keyMatcher = /^(.*?)\s*\(\d+\)$/
  const parsedKey = keyMatcher.test(key) ? key.match(keyMatcher)![1] : key
  const sameKeyCount = existingKeys.reduce((acc, existingKey) => {
    if (
      (keyMatcher.test(existingKey) &&
        existingKey.match(keyMatcher)![1] === parsedKey) ||
      parsedKey === existingKey
    ) {
      return acc + 1
    }
    return acc
  }, 0)
  if (sameKeyCount === 0) return parsedKey
  return `${parsedKey} (${sameKeyCount})`
}
