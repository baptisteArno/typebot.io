// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getDeepKeys = (obj: any): string[] => {
  let keys: string[] = [];
  for (const key in obj) {
    if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      const subkeys = getDeepKeys(obj[key]);
      keys = keys.concat(subkeys.map((subkey) => key + parseKey(subkey)));
    } else if (Array.isArray(obj[key])) {
      if (obj[key].length === 0) continue;

      if (typeof obj[key][0] !== "object") {
        keys.push(key);
        keys = keys.concat(
          obj[key].map((_: string, index: number) => `${key}[${index}]`),
        );
        continue;
      }

      const subkeys = getDeepKeys(obj[key][0]);
      if (obj[key].length > 1) {
        keys = keys.concat(
          subkeys.map(
            (subkey) => `${key}.flatMap(item => item${parseKey(subkey)})`,
          ),
        );
      }
      keys = keys.concat(
        subkeys.map((subkey) => `${key}[0]${parseKey(subkey)}`),
      );
    } else {
      keys.push(key);
    }
  }
  return keys;
};

const parseKey = (key: string) => {
  if (
    (key.includes(" ") ||
      key.includes("-") ||
      !isNaN(key as unknown as number)) &&
    !key.includes(".flatMap(item => item") &&
    !key.includes("['") &&
    !key.includes("']")
  ) {
    return `['${key}']`;
  }
  return `.${key}`;
};
