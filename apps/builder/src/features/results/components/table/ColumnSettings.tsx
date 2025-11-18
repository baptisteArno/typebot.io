import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { isDefined } from "@typebot.io/lib/utils";
import type { ResultHeaderCell } from "@typebot.io/results/schemas/results";
import { Button } from "@typebot.io/ui/components/Button";
import { DragDropVerticalIcon } from "@typebot.io/ui/icons/DragDropVerticalIcon";
import { ViewIcon } from "@typebot.io/ui/icons/ViewIcon";
import { ViewOffSlashIcon } from "@typebot.io/ui/icons/ViewOffSlashIcon";
import { cx } from "@typebot.io/ui/lib/cva";
import { HeaderIcon } from "../HeaderIcon";

type Props = {
  resultHeader: ResultHeaderCell[];
  columnVisibility: { [key: string]: boolean };
  columnOrder: string[];
  onColumnOrderChange: (columnOrder: string[]) => void;
  setColumnVisibility: (columnVisibility: { [key: string]: boolean }) => void;
};

export const ColumnSettings = ({
  resultHeader,
  columnVisibility,
  setColumnVisibility,
  columnOrder,
  onColumnOrderChange,
}: Props) => {
  const toggleColumnVisibility = (id: string) => () => {
    setColumnVisibility({
      ...columnVisibility,
      [id]: isDefined(columnVisibility[id]) ? !columnVisibility[id] : false,
    });
  };

  const draggableColumnIds = columnOrder.filter(
    (id) => id !== "select" && id !== "logs",
  );

  return (
    <div className="flex flex-col gap-2">
      <p className="font-medium text-sm">Shown in table:</p>
      <DragDropProvider
        onDragEnd={(event) => {
          onColumnOrderChange([...move(draggableColumnIds, event)]);
        }}
      >
        {draggableColumnIds.map((id, index) => (
          <SortableColumns
            key={id}
            header={resultHeader.find((h) => h.id === id)!}
            toggleColumnVisibility={toggleColumnVisibility}
            columnVisibility={columnVisibility}
            index={index}
          />
        ))}
      </DragDropProvider>
    </div>
  );
};

const SortableColumns = ({
  header,
  columnVisibility,
  index,
  toggleColumnVisibility,
}: {
  header: ResultHeaderCell;
  columnVisibility: { [key: string]: boolean };
  index: number;
  toggleColumnVisibility: (key: string) => () => void;
}) => {
  const { ref, isDragging, handleRef } = useSortable({
    id: header.id,
    index,
  });

  const isHidden = columnVisibility[header.id] === false;

  return (
    <div
      ref={ref}
      className={cx(
        "flex justify-between",
        isDragging || isHidden ? "opacity-50" : "opacity-100",
      )}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <Button
          size="icon"
          className="cursor-grab size-7"
          aria-label="Drag"
          variant="ghost"
          ref={handleRef}
        >
          <DragDropVerticalIcon />
        </Button>
        <HeaderIcon header={header} />
        <p className="truncate">{header.label}</p>
      </div>
      <Button
        size="icon"
        aria-label="Hide column"
        onClick={toggleColumnVisibility(header.id)}
        className="size-7"
        variant="secondary"
      >
        {isHidden ? <ViewOffSlashIcon /> : <ViewIcon />}
      </Button>
    </div>
  );
};
