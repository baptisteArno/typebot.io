import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ResultHeaderCell } from "@typebot.io/results/schemas/results";
import { Button } from "@typebot.io/ui/components/Button";
import { DragDropVerticalIcon } from "@typebot.io/ui/icons/DragDropVerticalIcon";
import { ViewIcon } from "@typebot.io/ui/icons/ViewIcon";
import { ViewOffSlashIcon } from "@typebot.io/ui/icons/ViewOffSlashIcon";
import { cx } from "@typebot.io/ui/lib/cva";
import { useState } from "react";
import { Portal } from "@/components/Portal";
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
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const [draggingColumnId, setDraggingColumnId] = useState<string | null>(null);

  const onEyeClick = (id: string) => () => {
    columnVisibility[id] === false
      ? setColumnVisibility({ ...columnVisibility, [id]: true })
      : setColumnVisibility({ ...columnVisibility, [id]: false });
  };
  const sortedHeader = resultHeader.sort(
    (a, b) => columnOrder.indexOf(a.id) - columnOrder.indexOf(b.id),
  );
  const hiddenHeaders = resultHeader.filter(
    (header) => columnVisibility[header.id] === false,
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setDraggingColumnId(active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = columnOrder.indexOf(active.id as string);
      const newIndex = columnOrder.indexOf(over?.id as string);
      if (newIndex === -1 || oldIndex === -1) return;
      const newColumnOrder = arrayMove(columnOrder, oldIndex, newIndex);
      onColumnOrderChange(newColumnOrder);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="font-medium text-sm">Shown in table:</p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={columnOrder}
          strategy={verticalListSortingStrategy}
        >
          {sortedHeader.map((header) => (
            <SortableColumns
              key={header.id}
              header={header}
              onEyeClick={onEyeClick}
              hiddenHeaders={hiddenHeaders}
            />
          ))}
        </SortableContext>
        <Portal>
          <DragOverlay dropAnimation={{ duration: 0 }}>
            {draggingColumnId ? <div className="flex" /> : null}
          </DragOverlay>
        </Portal>
      </DndContext>
    </div>
  );
};

const SortableColumns = ({
  header,
  hiddenHeaders,
  onEyeClick,
}: {
  header: ResultHeaderCell;
  hiddenHeaders: ResultHeaderCell[];
  onEyeClick: (key: string) => () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: header.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isHidden = hiddenHeaders.some(
    (hiddenHeader) => hiddenHeader.id === header.id,
  );

  return (
    <div
      className={cx(
        "flex justify-between",
        isDragging || isHidden ? "opacity-50" : "opacity-100",
      )}
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <Button
          size="icon"
          className="cursor-grab size-7"
          aria-label={"Drag"}
          variant="ghost"
          {...listeners}
        >
          <DragDropVerticalIcon />
        </Button>
        <HeaderIcon header={header} />
        <p className="truncate">{header.label}</p>
      </div>
      <Button
        size="icon"
        aria-label={"Hide column"}
        onClick={onEyeClick(header.id)}
        className="size-7"
        variant="secondary"
      >
        {isHidden ? <ViewOffSlashIcon /> : <ViewIcon />}
      </Button>
    </div>
  );
};
