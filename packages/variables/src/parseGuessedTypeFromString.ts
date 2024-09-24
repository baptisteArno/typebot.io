export const parseGuessedTypeFromString = (value: string): unknown => {
  if (value === "undefined") return undefined;
  return safeJsonParse(value);
};

const safeJsonParse = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};
