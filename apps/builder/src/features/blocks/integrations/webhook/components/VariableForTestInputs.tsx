import type { TableListItemProps } from "@/components/TableList";
import { TextInput } from "@/components/inputs";
import { VariableSearchInput } from "@/components/inputs/VariableSearchInput";
import { FormControl, FormLabel, Stack } from "@chakra-ui/react";
import type { VariableForTest } from "@typebot.io/blocks-integrations/webhook/schema";
import type { Variable } from "@typebot.io/variables/schemas";

export const VariableForTestInputs = ({
  item,
  onItemChange,
}: TableListItemProps<VariableForTest>) => {
  const handleVariableSelect = (variable?: Variable) =>
    onItemChange({ ...item, variableId: variable?.id });
  const handleValueChange = (value: string) => {
    if (value === item.value) return;
    onItemChange({ ...item, value });
  };
  return (
    <Stack p="4" rounded="md" flex="1" borderWidth="1px">
      <FormControl>
        <FormLabel htmlFor={"name" + item.id}>Variable name:</FormLabel>
        <VariableSearchInput
          id={"name" + item.id}
          initialVariableId={item.variableId}
          onSelectVariable={handleVariableSelect}
        />
      </FormControl>
      <TextInput
        label="Test value:"
        defaultValue={item.value ?? ""}
        onChange={handleValueChange}
      />
    </Stack>
  );
};
