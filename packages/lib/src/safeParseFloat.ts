export const safeParseFloat = (value: string | number | undefined) => {
  if (typeof value === "number") return value;
  if (!value) return undefined;
  const parsedValue = Number.parseFloat(value.toString().replace(",", "."));
  return isNaN(parsedValue) ? undefined : parsedValue;
};
