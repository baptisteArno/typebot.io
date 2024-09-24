export const parseRecordsCreateBody = (
  fields: { key?: string; value?: string }[],
): Record<string, any> => {
  const record: Record<string, any> = {};

  fields.forEach(({ key, value }) => {
    if (!key || !value) return;
    record[key] = value;
  });

  return record;
};
