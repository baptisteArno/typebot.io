import type { ResultHeaderCell } from "./schemas/results";

export const parseColumnsOrder = (
  existingOrder: string[] | undefined,
  resultHeader: ResultHeaderCell[],
) => ["select", ...(existingOrder ?? resultHeader.map((h) => h.id)), "logs"];
