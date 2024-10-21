export const getDeepKeys = (obj: any): string[] => {
  let keys: string[] = [];
  for (const key in obj) {
    if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      const subkeys = getDeepKeys(obj[key]);
      keys = keys.concat(
        subkeys.map(
          (subkey) => `${parsePrevKey(key, subkey)}${parseNextKey(subkey)}`,
        ),
      );
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
            (subkey) =>
              `${key}.flatMap(item => ${parsePrevKey("item", subkey)}${parseNextKey(subkey)})`,
          ),
        );
      }
      keys = keys.concat(
        subkeys.map(
          (subkey) =>
            `${key}${parsePrevKey("0", subkey)}${parseNextKey(subkey)}`,
        ),
      );
    } else {
      keys.push(key);
    }
  }
  return keys;
};

const parsePrevKey = (key: string, suffix: string) => {
  if (
    key.includes(" ") ||
    key.includes("-") ||
    !isNaN(key as unknown as number)
  ) {
    return `['${key}'].`;
  }
  return suffix.startsWith("[") ? key : `${key}.`;
};

const parseNextKey = (key: string) => {
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
  return `${key}`;
};
