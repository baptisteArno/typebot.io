export const parseRecordsUpdateBody = (
  ids: string[],
  updates: { fieldName?: string; value?: string }[],
): Record<string, any>[] =>
  ids.map((id) => {
    const record: Record<string, any> = {
      Id: id,
    };

    updates.forEach(({ fieldName, value }) => {
      if (!fieldName) return;
      record[fieldName] = value ?? null;
    });

    return record;
  });
