import type { ResultHeaderCell } from "./schemas/results";

export const parseColumnsOrder = (
  existingOrder: string[] | undefined,
  resultHeader: ResultHeaderCell[],
) => {
  const resultHeaderIds = resultHeader.map((header) => header.id);

  if (existingOrder?.at(0) === "select")
    // Old format potentially broken, reset to default
    return ["select", ...resultHeaderIds, "logs"];

  const orderedHeaderIds = existingOrder ?? resultHeaderIds;
  const missingHeaderIds = resultHeaderIds.filter(
    (headerId) => !orderedHeaderIds.includes(headerId),
  );

  return ["select", ...orderedHeaderIds, ...missingHeaderIds, "logs"];
};
