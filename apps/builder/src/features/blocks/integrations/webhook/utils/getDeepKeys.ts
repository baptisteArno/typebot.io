// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getDeepKeys = (obj: any): string[] => {
  let keys: string[] = []
  for (const key in obj) {
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      const subkeys = getDeepKeys(obj[key])
      keys = keys.concat(
        subkeys.map(function (subkey) {
          return key + '.' + subkey
        })
      )
    } else if (Array.isArray(obj[key])) {
      for (let i = 0; i < obj[key].length; i++) {
        const subkeys = getDeepKeys(obj[key][i])
        keys = keys.concat(
          subkeys.map(function (subkey) {
            return key + '[' + i + ']' + '.' + subkey
          })
        )
      }
    } else {
      keys.push(key)
    }
  }
  return keys
}
