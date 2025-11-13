import type { ResultHeaderCell } from "./schemas/results";

export const parseColumnsOrder = (
  existingOrder: string[] | undefined,
  resultHeader: ResultHeaderCell[],
) => {
  return existingOrder?.at(0) === "select"
    ? // Old format potentially broken, reset to default
      ["select", ...resultHeader.map((h) => h.id), "logs"]
    : ["select", ...(existingOrder ?? resultHeader.map((h) => h.id)), "logs"];
};
