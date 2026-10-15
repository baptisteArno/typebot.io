// List variables are injected as JSON arrays, e.g. `["u-1","u-2"]`
export const parseUserIds = (rawUserIds: string | undefined) => {
  if (!rawUserIds) return [];
  return [...new Set(parseRawUserId(rawUserIds))];
};

const parseRawUserId = (rawUserId: string): string[] => {
  const trimmedRawUserId = rawUserId.trim();
  if (trimmedRawUserId.startsWith("[")) {
    const parsedList = parseJsonList(trimmedRawUserId);
    if (parsedList) return parsedList.flatMap(parseRawUserId);
  }
  return trimmedRawUserId
    .split(/[\s,]+/)
    .map((userId) => userId.replace(/^["']|["']$/g, ""))
    .filter((userId) => userId.length > 0);
};

const parseJsonList = (value: string) => {
  try {
    const parsedValue: unknown = JSON.parse(value);
    if (!Array.isArray(parsedValue)) return;
    return parsedValue.filter(
      (item): item is string => typeof item === "string",
    );
  } catch {
    return;
  }
};
