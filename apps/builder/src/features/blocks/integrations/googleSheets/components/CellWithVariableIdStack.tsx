import { Stack } from "@chakra-ui/react";
import type { ExtractingCell } from "@typebot.io/blocks-integrations/googleSheets/schema";
import type { Variable } from "@typebot.io/variables/schemas";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { VariablesCombobox } from "@/components/inputs/VariablesCombobox";
import type { TableListItemProps } from "@/components/TableList";

export const CellWithVariableIdStack = ({
  item,
  onItemChange,
  columns,
}: TableListItemProps<ExtractingCell> & { columns: string[] }) => {
  const handleColumnSelect = (column: string | undefined) => {
    if (item.column === column) return;
    onItemChange({ ...item, column });
  };

  const handleVariableIdChange = (variable?: Variable) => {
    if (item.variableId === variable?.id) return;
    onItemChange({ ...item, variableId: variable?.id });
  };

  return (
    <Stack p="4" rounded="md" flex="1" borderWidth="1px">
      <BasicSelect
        value={item.column}
        onChange={handleColumnSelect}
        items={columns}
        placeholder="Select a column"
      />
      <VariablesCombobox
        initialVariableId={item.variableId}
        onSelectVariable={handleVariableIdChange}
      />
    </Stack>
  );
};
