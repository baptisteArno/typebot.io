export const transformKeyValueListToObject = (
  inputs?: { key?: string; value?: any }[],
): Record<string, any> => {
  const result: Record<string, any> = {};

  inputs?.forEach(({ key, value }) => {
    if (key) result[key] = value;
  });

  return result;
};
