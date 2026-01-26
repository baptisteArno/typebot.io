export const normalizeEmail = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  return normalized;
};
