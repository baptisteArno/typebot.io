// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getDeepKeys = (obj: any): string[] => {
  let keys: string[] = []
  for (const key in obj) {
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      const subkeys = getDeepKeys(obj[key])
      keys = keys.concat(
        subkeys.map(function (subkey) {
          return key + parseKey(subkey)
        })
      )
    } else if (Array.isArray(obj[key])) {
      const subkeys = getDeepKeys(obj[key][0])
      keys = keys.concat(
        subkeys.map(function (subkey) {
          return `${key}.map(item => item${parseKey(subkey)})`
        })
      )
    } else {
      keys.push(key)
    }
  }
  return keys
}

const parseKey = (key: string) => {
  if (key.includes(' ') && !key.includes('.map((item) => item')) {
    return `['${key}']`
  }
  return `.${key}`
}
