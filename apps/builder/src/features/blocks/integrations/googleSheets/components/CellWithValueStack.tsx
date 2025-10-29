import type { Cell } from "@typebot.io/blocks-integrations/googleSheets/schema";
import { Button } from "@typebot.io/ui/components/Button";
import { MoreVerticalIcon } from "@typebot.io/ui/icons/MoreVerticalIcon";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { DebouncedTextInputWithVariablesButton } from "@/components/inputs/DebouncedTextInput";
import type { TableListItemProps } from "@/components/TableList";

export const CellWithValueStack = ({
  item,
  onItemChange,
  columns,
}: TableListItemProps<Cell> & { columns: string[] }) => {
  const handleColumnSelect = (column: string | undefined) => {
    if (item.column === column) return;
    onItemChange({ ...item, column });
  };
  const handleValueChange = (value: string) => {
    if (item.value === value) return;
    onItemChange({ ...item, value });
  };
  return (
    <div className="flex flex-col gap-2 p-4 rounded-md flex-1 border w-full relative">
      <Button
        size="icon"
        variant="secondary"
        className="absolute top-2 right-2"
      >
        <MoreVerticalIcon />
      </Button>
      <BasicSelect
        value={item.column}
        onChange={handleColumnSelect}
        items={columns}
        placeholder="Select a column"
      />
      <DebouncedTextInputWithVariablesButton
        defaultValue={item.value ?? ""}
        onValueChange={handleValueChange}
        placeholder="Type a value..."
      />
    </div>
  );
};
