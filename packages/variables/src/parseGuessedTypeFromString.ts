export const parseGuessedTypeFromString = (value: string): unknown => {
  if (value === "undefined") return;
  return safeJsonParse(value);
};

const safeJsonParse = (value: string): unknown => {
  try {
    const parsedValue = JSON.parse(value);
    // Integers outside the safe range (e.g. WhatsApp Business Account IDs)
    // can't be represented exactly as a JS number, keep them as strings
    if (
      typeof parsedValue === "number" &&
      Number.isInteger(parsedValue) &&
      !Number.isSafeInteger(parsedValue)
    )
      return value;
    return parsedValue;
  } catch {
    return value;
  }
};
