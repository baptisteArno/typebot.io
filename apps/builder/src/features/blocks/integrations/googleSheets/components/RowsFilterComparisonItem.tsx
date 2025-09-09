import { Stack } from "@chakra-ui/react";
import type { RowsFilterComparison } from "@typebot.io/blocks-integrations/googleSheets/schema";
import { ComparisonOperators } from "@typebot.io/conditions/constants";
import { TextInput } from "@/components/inputs";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import type { TableListItemProps } from "@/components/TableList";

export const RowsFilterComparisonItem = ({
  item,
  columns,
  onItemChange,
}: TableListItemProps<RowsFilterComparison> & { columns: string[] }) => {
  const handleColumnSelect = (column: string | undefined) => {
    if (column === item.column) return;
    onItemChange({ ...item, column });
  };

  const handleSelectComparisonOperator = (
    comparisonOperator: ComparisonOperators | undefined,
  ) => {
    if (comparisonOperator === item.comparisonOperator) return;
    onItemChange({ ...item, comparisonOperator });
  };

  const handleChangeValue = (value: string) => {
    if (value === item.value) return;
    onItemChange({ ...item, value });
  };

  return (
    <Stack p="4" rounded="md" flex="1" borderWidth="1px">
      <BasicSelect
        value={item.column}
        onChange={handleColumnSelect}
        items={columns}
        placeholder="Select a column"
      />
      <BasicSelect
        value={item.comparisonOperator}
        onChange={handleSelectComparisonOperator}
        items={Object.values(ComparisonOperators)}
        placeholder="Select an operator"
      />
      {item.comparisonOperator !== ComparisonOperators.IS_SET &&
        item.comparisonOperator !== ComparisonOperators.IS_EMPTY && (
          <TextInput
            defaultValue={item.value ?? ""}
            onChange={handleChangeValue}
            placeholder="Type a value..."
          />
        )}
    </Stack>
  );
};
