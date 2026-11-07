const e164Pattern = /^\+[1-9]\d{1,14}$/;

export const normalizeE164 = (value: string | undefined) => {
  const normalized = value?.replace(/[\s()-]/g, "") ?? "";
  if (!e164Pattern.test(normalized)) return undefined;
  return normalized;
};
