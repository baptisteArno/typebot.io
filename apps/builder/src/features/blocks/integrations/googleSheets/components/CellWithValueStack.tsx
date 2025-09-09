import { Stack } from "@chakra-ui/react";
import type { Cell } from "@typebot.io/blocks-integrations/googleSheets/schema";
import { TextInput } from "@/components/inputs";
import { BasicSelect } from "@/components/inputs/BasicSelect";
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
    <Stack p="4" rounded="md" flex="1" borderWidth="1px" w="full">
      <BasicSelect
        value={item.column}
        onChange={handleColumnSelect}
        items={columns}
        placeholder="Select a column"
      />
      <TextInput
        defaultValue={item.value ?? ""}
        onChange={handleValueChange}
        placeholder="Type a value..."
      />
    </Stack>
  );
};
