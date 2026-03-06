import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@typebot.io/ui/components/Button";
import { InputGroup } from "@typebot.io/ui/components/InputGroup";
import { Table } from "@typebot.io/ui/components/Table";
import { PlusSignIcon } from "@typebot.io/ui/icons/PlusSignIcon";
import { Search01Icon } from "@typebot.io/ui/icons/Search01Icon";
import * as React from "react";
import type { Contact } from "../../domain/Contact";

function getMetaClassName(
  meta: unknown,
  key: "headerClassName" | "cellClassName",
): string | undefined {
  if (!meta || typeof meta !== "object" || !(key in meta)) return undefined;
  const value = (meta as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
}

type Props = {
  contacts: readonly Contact[];
  columns: ColumnDef<Contact, unknown>[];
  onAddContact?: () => void;
  onBulkDelete?: (contactIds: string[]) => void;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  isLoading?: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: (
    updater: (prev: Record<string, boolean>) => Record<string, boolean>,
  ) => void;
};

const defaultRowSelection = {};

export const ContactsDataTable = ({
  contacts,
  columns,
  onAddContact,
  onBulkDelete,
  hasNextPage,
  hasPreviousPage,
  onNextPage,
  onPreviousPage,
  isLoading,
  searchValue,
  onSearchChange,
  rowSelection = defaultRowSelection,
  onRowSelectionChange,
}: Props) => {
  const [internalRowSelection, setInternalRowSelection] = React.useState<
    Record<string, boolean>
  >({});
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const isControlled = onRowSelectionChange !== undefined;
  const effectiveRowSelection = isControlled
    ? rowSelection
    : internalRowSelection;
  const setRowSelection = isControlled
    ? onRowSelectionChange!
    : setInternalRowSelection;

  const table = useReactTable({
    data: contacts as Contact[],
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: (updater) =>
      setSorting((prev) =>
        typeof updater === "function" ? updater(prev) : prev,
      ),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: (updater) =>
      setColumnFilters((prev) =>
        typeof updater === "function" ? updater(prev) : prev,
      ),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: (updater) =>
      setRowSelection((prev) =>
        typeof updater === "function" ? updater(prev) : prev,
      ),
    state: {
      sorting,
      columnFilters,
      rowSelection: effectiveRowSelection,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;
  const selectedContactIds = selectedRows.map((row) => row.id);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center py-2">
        <InputGroup.Root className="max-w-sm">
          <InputGroup.Addon>
            <Search01Icon />
          </InputGroup.Addon>
          <InputGroup.Input
            placeholder="Search by name, email, phone or property values..."
            value={searchValue}
            onValueChange={onSearchChange}
          />
        </InputGroup.Root>
        <div className="ml-auto flex items-center gap-2">
          {selectedCount > 0 && onBulkDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkDelete(selectedContactIds)}
            >
              Delete selected ({selectedCount})
            </Button>
          )}
          {onAddContact && (
            <Button variant="default" size="sm" onClick={onAddContact}>
              <PlusSignIcon className="mr-2 size-4" />
              Add contact
            </Button>
          )}
        </div>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table.Root>
          <Table.Header>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta;
                  const headerClassName = getMetaClassName(
                    meta,
                    "headerClassName",
                  );
                  return (
                    <Table.Head key={header.id} className={headerClassName}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </Table.Head>
                  );
                })}
              </Table.Row>
            ))}
          </Table.Header>
          <Table.Body>
            {isLoading ? (
              <Table.Row>
                <Table.Cell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Loading…
                </Table.Cell>
              </Table.Row>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <Table.Row
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta;
                    const cellClassName = getMetaClassName(
                      meta,
                      "cellClassName",
                    );
                    return (
                      <Table.Cell key={cell.id} className={cellClassName}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </Table.Cell>
                    );
                  })}
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </div>
      <div className="flex items-center justify-between py-2">
        <div className="text-sm text-muted-foreground">
          {selectedCount} of {table.getRowModel().rows.length} row(s) selected.
        </div>
        {onPreviousPage !== undefined && onNextPage !== undefined ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPreviousPage}
              disabled={!hasPreviousPage}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onNextPage}
              disabled={!hasNextPage}
            >
              Next
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
