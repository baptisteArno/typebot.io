const formulaPrefixes = ["=", "+", "-", "@", "\t", "\r"];

export const sanitizeCsvCell = <T extends string | undefined | null>(
  value: T,
): T extends string ? string : T => {
  if (typeof value !== "string" || value.length === 0)
    return value as T extends string ? string : T;
  return (
    formulaPrefixes.includes(value[0]!) ? `'${value}` : value
  ) as T extends string ? string : T;
};
