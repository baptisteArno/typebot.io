export const computeDeepKeysMappingSuggestionList = (obj: any): string[] => {
  let keys: string[] = [];
  for (const key in obj) {
    if (obj[key] && typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      const subkeys = computeDeepKeysMappingSuggestionList(obj[key]);
      keys = keys.concat(
        subkeys.map(
          (subkey) => `${parsePrevKey(key, subkey)}${parseNextKey(subkey)}`,
        ),
      );
    } else if (Array.isArray(obj[key])) {
      if (typeof obj[key][0] !== "object") {
        if (obj[key].every((item: any) => typeof item !== "object"))
          keys.push(key);
        keys = keys.concat(
          obj[key].map((_: string, index: number) => `${key}[${index}]`),
        );
        continue;
      }

      const subkeys = new Set<string>();
      for (const item of obj[key]) {
        const subkeysItem = computeDeepKeysMappingSuggestionList(item);
        subkeysItem.forEach((subkey) => subkeys.add(subkey));
      }

      if (obj[key].length > 1) {
        keys = keys.concat(
          [...subkeys].map(
            (subkey) =>
              `${key}.flatMap(item => ${parsePrevKey("item", subkey)}${parseNextKey(subkey)})`,
          ),
        );
      }
      keys = keys.concat(
        [...subkeys].map(
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
  let currentKey = key;
  if (shouldUseBracketNotation(key)) {
    currentKey = parseBracketsKey(key);
  }
  return parseNextKey(suffix).startsWith("[") ? currentKey : `${currentKey}.`;
};

const parseNextKey = (key: string) => {
  if (
    shouldUseBracketNotation(key) &&
    !key.includes(".flatMap(item => item") &&
    !key.includes("['") &&
    !key.includes("']")
  ) {
    return parseBracketsKey(key);
  }
  return `${key}`;
};

const parseBracketsKey = (key: string) => {
  if (!isNumericKey(key)) return `['${key}']`;
  return `[${key}]`;
};

const shouldUseBracketNotation = (key: string) =>
  key.includes(" ") || key.includes("-") || isNumericKey(key);

const isNumericKey = (key: string) => !Number.isNaN(Number(key));
