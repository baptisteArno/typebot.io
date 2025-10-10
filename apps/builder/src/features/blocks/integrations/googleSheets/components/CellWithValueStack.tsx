import { Stack } from "@chakra-ui/react";
import type { Cell } from "@typebot.io/blocks-integrations/googleSheets/schema";
import { Button } from "@typebot.io/ui/components/Button";
import { MoreVerticalIcon } from "@/components/icons";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { TextInput } from "@/components/inputs/TextInput";
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
    <Stack
      p="4"
      rounded="md"
      flex="1"
      borderWidth="1px"
      w="full"
      pos="relative"
    >
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
      <TextInput
        defaultValue={item.value ?? ""}
        onChange={handleValueChange}
        placeholder="Type a value..."
      />
    </Stack>
  );
};
