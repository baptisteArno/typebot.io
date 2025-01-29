export const parseGroups = (groups?: { type?: string; key?: string }[]) => {
  if (!groups) return;
  const parsedGroups: Record<string, string> = {};

  groups.forEach(({ type, key }) => {
    if (!key?.trim() || !type?.trim()) return;
    parsedGroups[type] = key;
  });

  return parsedGroups;
};
