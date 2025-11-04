import { type Cell as CellProps, flexRender } from "@tanstack/react-table";
import type { TableData } from "@typebot.io/results/schemas/results";
import { Button } from "@typebot.io/ui/components/Button";
import { ArrowExpand01Icon } from "@typebot.io/ui/icons/ArrowExpand01Icon";
import { cx } from "@typebot.io/ui/lib/cva";
import { memo } from "react";

type Props = {
  cell: CellProps<TableData, unknown>;
  size: number;
  isExpandButtonVisible: boolean;
  cellIndex: number;
  isSelected: boolean;
  onExpandButtonClick: () => void;
};

const Cell = ({
  cell,
  size,
  isExpandButtonVisible,
  cellIndex,
  onExpandButtonClick,
}: Props) => {
  return (
    <td
      key={cell.id}
      style={
        {
          "--size": size + "px",
        } as React.CSSProperties
      }
      className={cx(
        "px-4 py-2 border-b border-r first:border-l border-gray-6 whitespace-pre-wrap not-has-[button]:truncate relative min-w-(--size) max-w-(--size)",
      )}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
      <span className="absolute top-0 right-2 h-full inline-flex items-center">
        {isExpandButtonVisible && cellIndex === 1 && (
          <Button
            className="shadow-md animate-in fade-in-0"
            variant="secondary"
            size="xs"
            onClick={onExpandButtonClick}
          >
            <ArrowExpand01Icon />
            Open
          </Button>
        )}
      </span>
    </td>
  );
};

export default memo(
  Cell,
  (prev, next) =>
    prev.size === next.size &&
    prev.isExpandButtonVisible === next.isExpandButtonVisible &&
    prev.isSelected === next.isSelected,
);
