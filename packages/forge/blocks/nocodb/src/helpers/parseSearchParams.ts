export const parseSearchParams = (
  records: Record<string, any>,
): Record<string, string> => {
  return Object.entries(records).reduce((acc, [key, value]) => {
    if (value === null || value === undefined) return acc;
    return { ...acc, [key]: value.toString() };
  }, {});
};
