import type { ResultHeaderCell } from "@typebot.io/results/schemas/results";
import { HeaderIcon } from "../components/HeaderIcon";
import type { HeaderCell } from "../types";

export const parseHeaderCells = (
  resultHeader: ResultHeaderCell[],
): HeaderCell[] =>
  resultHeader.map((header) => ({
    Header: (
      <div className="flex items-center gap-2 min-w-[150px] max-w-[500px]">
        <HeaderIcon header={header} />
        <p>{header.label}</p>
      </div>
    ),
    accessor: header.id,
  }));
