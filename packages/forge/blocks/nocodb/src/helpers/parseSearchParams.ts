export const parseSearchParams = (
  records: Record<string, any>,
): Record<string, string> => {
  return Object.entries(records).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      if (value === null || value === undefined) return acc;
      acc[key] = value.toString();
      return acc;
    },
    {},
  );
};
