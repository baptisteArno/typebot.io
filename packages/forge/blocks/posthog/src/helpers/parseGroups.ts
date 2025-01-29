export const parseGroups = (groups?: { type?: string; key?: string }[]) => {
  if (!groups) return;
  const parsedGroups: Record<string, any> = {};

  groups.forEach(({ type, key }) => {
    if (!key || !type) return;
    parsedGroups[type] = key;
  });

  return parsedGroups;
};
