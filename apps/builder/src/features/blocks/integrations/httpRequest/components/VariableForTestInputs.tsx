import { Stack } from "@chakra-ui/react";
import type { VariableForTest } from "@typebot.io/blocks-integrations/httpRequest/schema";
import { Field } from "@typebot.io/ui/components/Field";
import type { Variable } from "@typebot.io/variables/schemas";
import { TextInput } from "@/components/inputs/TextInput";
import { VariablesCombobox } from "@/components/inputs/VariablesCombobox";
import type { TableListItemProps } from "@/components/TableList";

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
      <Field.Root>
        <Field.Label>Variable name:</Field.Label>
        <VariablesCombobox
          initialVariableId={item.variableId}
          onSelectVariable={handleVariableSelect}
        />
      </Field.Root>
      <TextInput
        label="Test value:"
        defaultValue={item.value ?? ""}
        onChange={handleValueChange}
      />
    </Stack>
  );
};
