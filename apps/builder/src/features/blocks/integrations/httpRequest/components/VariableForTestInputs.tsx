import type { VariableForTest } from "@typebot.io/blocks-integrations/httpRequest/schema";
import { Field } from "@typebot.io/ui/components/Field";
import type { Variable } from "@typebot.io/variables/schemas";
import { DebouncedTextInputWithVariablesButton } from "@/components/inputs/DebouncedTextInput";
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
    <div className="flex flex-col gap-2 p-4 rounded-md flex-1 border">
      <Field.Root>
        <Field.Label>Variable name:</Field.Label>
        <VariablesCombobox
          initialVariableId={item.variableId}
          onSelectVariable={handleVariableSelect}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>Test value:</Field.Label>
        <DebouncedTextInputWithVariablesButton
          defaultValue={item.value ?? ""}
          onValueChange={handleValueChange}
        />
      </Field.Root>
    </div>
  );
};
