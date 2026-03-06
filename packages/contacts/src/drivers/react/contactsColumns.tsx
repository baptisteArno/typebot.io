import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@typebot.io/ui/components/Button";
import { Checkbox } from "@typebot.io/ui/components/Checkbox";
import { Menu } from "@typebot.io/ui/components/Menu";
import { ArrowDown01Icon } from "@typebot.io/ui/icons/ArrowDown01Icon";
import { ArrowUp01Icon } from "@typebot.io/ui/icons/ArrowUp01Icon";
import { MoreHorizontalIcon } from "@typebot.io/ui/icons/MoreHorizontalIcon";
import type { Contact } from "../../domain/Contact";
import type { ContactPropertyDefinitionData } from "../../domain/ContactPropertyDefinition";

const getPropertyValue = (
  contact: Contact,
  key: string,
): string | number | null => {
  const prop = contact.properties.find((property) => property.key === key);
  return prop ? prop.value : null;
};

export function createContactsColumns({
  propertyDefinitions,
  onEdit,
  onDelete,
}: {
  propertyDefinitions: readonly Pick<
    ContactPropertyDefinitionData,
    "key" | "type"
  >[];
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}): ColumnDef<Contact, unknown>[] {
  const propertyColumns: ColumnDef<Contact, unknown>[] =
    propertyDefinitions.map((def) => ({
      id: `property-${def.key}`,
      accessorFn: (row) => getPropertyValue(row, def.key),
      enableHiding: true,
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 w-full justify-start px-0 hover:bg-transparent"
        >
          {def.key.charAt(0).toUpperCase() + def.key.slice(1)}
          {column.getIsSorted() === "asc" ? (
            <ArrowUp01Icon className="ml-2 size-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowUp01Icon className="ml-2 size-4 opacity-50" />
          ) : (
            <ArrowDown01Icon className="ml-2 size-4 opacity-50" />
          )}
        </Button>
      ),
      cell: ({ row }) => {
        const value = getPropertyValue(row.original, def.key);
        return <span>{value ?? "—"}</span>;
      },
    }));

  return [
    {
      id: "select",
      size: 40,
      maxSize: 40,
      header: ({ table }) => (
        <div className="px-1">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onCheckedChange={(checked) =>
              table.getToggleAllPageRowsSelectedHandler()({
                target: { checked },
              })
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="px-1">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(checked) =>
              row.getToggleSelectedHandler()({ target: { checked } })
            }
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      id: "name",
      enableHiding: true,
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 w-full justify-start px-0 hover:bg-transparent"
        >
          Name
          {column.getIsSorted() === "asc" ? (
            <ArrowUp01Icon className="ml-2 size-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowUp01Icon className="ml-2 size-4 opacity-50" />
          ) : (
            <ArrowDown01Icon className="ml-2 size-4 opacity-50" />
          )}
        </Button>
      ),
      cell: ({ row }) => <span>{row.original.name ?? "—"}</span>,
    },
    ...propertyColumns,
    {
      accessorKey: "createdAt",
      id: "createdAt",
      enableHiding: true,
      size: 168,
      minSize: 168,
      maxSize: 168,
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 w-full justify-start px-0 hover:bg-transparent"
        >
          Created at
          {column.getIsSorted() === "asc" ? (
            <ArrowUp01Icon className="ml-2 size-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowUp01Icon className="ml-2 size-4 opacity-50" />
          ) : (
            <ArrowDown01Icon className="ml-2 size-4 opacity-50" />
          )}
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue("createdAt");
        if (typeof date !== "string" && !(date instanceof Date)) return "—";
        const d = date instanceof Date ? date : new Date(date);
        return (
          <span className="tabular-nums text-muted-foreground">
            {d.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      size: 48,
      maxSize: 48,
      cell: ({ row }) => {
        const contact = row.original;
        return (
          <div className="flex justify-end">
            <Menu.Root>
              <Menu.TriggerButton
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <MoreHorizontalIcon className="h-4 w-4" />
              </Menu.TriggerButton>
              <Menu.Popup align="end">
                <Menu.Item onClick={() => onEdit(contact)}>Edit</Menu.Item>
                <Menu.Item
                  onClick={() => onDelete(contact)}
                  className="text-red-11"
                >
                  Delete
                </Menu.Item>
              </Menu.Popup>
            </Menu.Root>
          </div>
        );
      },
      enableSorting: false,
    },
  ];
}
