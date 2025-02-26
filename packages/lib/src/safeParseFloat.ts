export const safeParseFloat = (value: string) => {
  const parsedValue = Number.parseFloat(value);
  return isNaN(parsedValue) ? undefined : parsedValue;
};
