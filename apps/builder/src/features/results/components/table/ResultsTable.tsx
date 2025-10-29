import {
  type ColumnDef,
  getCoreRowModel,
  type Updater,
  useReactTable,
} from "@tanstack/react-table";
import { parseColumnsOrder } from "@typebot.io/results/parseColumnsOrder";
import type {
  CellValueType,
  ResultHeaderCell,
  TableData,
} from "@typebot.io/results/schemas/results";
import type { ResultsTablePreferences } from "@typebot.io/typebot/schemas/typebot";
import { Button } from "@typebot.io/ui/components/Button";
import { Checkbox } from "@typebot.io/ui/components/Checkbox";
import { TextAlignLeftIcon } from "@typebot.io/ui/icons/TextAlignLeftIcon";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { TimeFilterSelect } from "@/features/analytics/components/TimeFilterSelect";
import type { timeFilterValues } from "@/features/analytics/constants";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { HeaderIcon } from "../HeaderIcon";
import { HeaderRow } from "./HeaderRow";
import { LoadingRows } from "./LoadingRows";
import { Row } from "./Row";
import { SelectionToolbar } from "./SelectionToolbar";
import { TableSettingsButton } from "./TableSettingsButton";

type ResultsTableProps = {
  resultHeader: ResultHeaderCell[];
  data: TableData[];
  hasMore?: boolean;
  preferences?: ResultsTablePreferences;
  timeFilter: (typeof timeFilterValues)[number];
  onTimeFilterChange: (timeFilter: (typeof timeFilterValues)[number]) => void;
  onScrollToBottom: () => void;
  onLogOpenIndex: (index: number) => () => void;
  onResultExpandIndex: (index: number) => () => void;
};

export const ResultsTable = ({
  resultHeader,
  data,
  hasMore,
  preferences,
  timeFilter,
  onTimeFilterChange,
  onScrollToBottom,
  onLogOpenIndex,
  onResultExpandIndex,
}: ResultsTableProps) => {
  const { updateTypebot, currentUserMode } = useTypebot();
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const bottomElement = useRef<HTMLDivElement | null>(null);
  const tableWrapper = useRef<HTMLDivElement | null>(null);

  const {
    columnsOrder,
    columnsVisibility = {},
    columnsWidth = {},
  } = {
    ...preferences,
    columnsOrder: parseColumnsOrder(preferences?.columnsOrder, resultHeader),
  };

  const changeColumnOrder = (newColumnOrder: string[]) => {
    if (typeof newColumnOrder === "function") return;
    updateTypebot({
      updates: {
        resultsTablePreferences: {
          columnsOrder: newColumnOrder,
          columnsVisibility,
          columnsWidth,
        },
      },
    });
  };

  const changeColumnVisibility = (
    newColumnVisibility: Record<string, boolean>,
  ) => {
    if (typeof newColumnVisibility === "function") return;
    updateTypebot({
      updates: {
        resultsTablePreferences: {
          columnsVisibility: newColumnVisibility,
          columnsWidth,
          columnsOrder,
        },
      },
    });
  };

  const changeColumnSizing = (
    newColumnSizing: Updater<Record<string, number>>,
  ) => {
    if (typeof newColumnSizing === "object") return;
    updateTypebot({
      updates: {
        resultsTablePreferences: {
          columnsWidth: newColumnSizing(columnsWidth),
          columnsVisibility,
          columnsOrder,
        },
      },
    });
  };

  const columns = React.useMemo<ColumnDef<TableData>[]>(
    () => [
      {
        id: "select",
        enableResizing: false,
        maxSize: 40,
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onCheckedChange={(checked) =>
              table.getToggleAllRowsSelectedHandler()({ target: { checked } })
            }
          />
        ),
        cell: ({ row }) => (
          <div className="px-1">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(checked) =>
                row.getToggleSelectedHandler()({ target: { checked } })
              }
            />
          </div>
        ),
      },
      ...resultHeader.map<ColumnDef<TableData>>((header) => ({
        id: header.id,
        accessorKey: header.id,
        size: 200,
        header: () => (
          <div
            className="flex items-center gap-2 overflow-hidden"
            data-testid={`${header.label} header`}
          >
            <HeaderIcon header={header} />
            <p>{header.label}</p>
          </div>
        ),
        cell: (info) => {
          const value = info?.getValue() as CellValueType | undefined;
          if (!value) return;
          return value.element || value.plainText || "";
        },
      })),
      {
        id: "logs",
        enableResizing: false,
        maxSize: 110,
        header: () => (
          <div className="flex items-center gap-2">
            <TextAlignLeftIcon />
            <p>Logs</p>
          </div>
        ),
        cell: ({ row }) => (
          <Button
            variant="secondary"
            size="sm"
            onClick={onLogOpenIndex(row.index)}
          >
            See logs
          </Button>
        ),
      },
    ],
    [onLogOpenIndex, resultHeader],
  );

  const instance = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      columnVisibility: columnsVisibility,
      columnOrder: columnsOrder,
      columnSizing: columnsWidth,
    },
    getRowId: (row) => row.id.plainText,
    columnResizeMode: "onChange",
    onRowSelectionChange: setRowSelection,
    onColumnSizingChange: changeColumnSizing,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleObserver = useCallback(
    (entities: IntersectionObserverEntry[]) => {
      const target = entities[0];
      if (target.isIntersecting) onScrollToBottom();
    },
    [onScrollToBottom],
  );

  useEffect(() => {
    if (!bottomElement.current) return;
    const options: IntersectionObserverInit = {
      root: tableWrapper.current,
      threshold: 0,
    };
    const observer = new IntersectionObserver(handleObserver, options);
    if (bottomElement.current) observer.observe(bottomElement.current);

    return () => {
      observer.disconnect();
    };
    // We need to rerun this effect when the bottomElement changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleObserver, bottomElement.current]);

  return (
    <div className="flex flex-col max-w-[1600px] px-4 overflow-y-hidden gap-6">
      <div className="flex items-center gap-2 w-full justify-end">
        {currentUserMode === "write" && (
          <SelectionToolbar
            selectedResultsId={Object.keys(rowSelection)}
            onClearSelection={() => setRowSelection({})}
          />
        )}
        <TimeFilterSelect
          size="sm"
          timeFilter={timeFilter}
          onTimeFilterChange={onTimeFilterChange}
        />
        <TableSettingsButton
          resultHeader={resultHeader}
          columnVisibility={columnsVisibility}
          setColumnVisibility={changeColumnVisibility}
          columnOrder={columnsOrder}
          onColumnOrderChange={changeColumnOrder}
        />
      </div>
      <div
        className="overflow-auto"
        ref={tableWrapper}
        data-testid="results-table"
      >
        <table className="bg-gray-1 border-separate border-spacing-0">
          <thead>
            {instance.getHeaderGroups().map((headerGroup) => (
              <HeaderRow key={headerGroup.id} headerGroup={headerGroup} />
            ))}
          </thead>

          <tbody>
            {instance.getRowModel().rows.map((row, rowIndex) => (
              <Row
                row={row}
                key={row.id}
                bottomElement={
                  rowIndex === data.length - 10 ? bottomElement : undefined
                }
                isSelected={row.getIsSelected()}
                onExpandButtonClick={onResultExpandIndex(rowIndex)}
              />
            ))}
            {hasMore === true && (
              <LoadingRows
                totalColumns={
                  resultHeader.filter(
                    (header) => columnsVisibility[header.id] !== false,
                  ).length + 1
                }
              />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
