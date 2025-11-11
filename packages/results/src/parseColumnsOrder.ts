import type { ResultHeaderCell } from "./schemas/results";

export const parseColumnsOrder = (
  existingOrder: string[] | undefined,
  resultHeader: ResultHeaderCell[],
) => {
  return existingOrder?.at(0) === "select"
    ? existingOrder
    : ["select", ...(existingOrder ?? resultHeader.map((h) => h.id)), "logs"];
};
