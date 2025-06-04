export const getIp = (headers: {
  "x-forwarded-for"?: string | null;
  "cf-connecting-ip"?: string | null;
}): string | null =>
  headers["cf-connecting-ip"]?.toLowerCase().trim() ||
  headers["x-forwarded-for"]?.split(",")[0]?.toLowerCase().trim() ||
  null;
