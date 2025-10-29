import type { KeyValue } from "@typebot.io/blocks-integrations/httpRequest/schema";
import { Field } from "@typebot.io/ui/components/Field";
import { DebouncedTextInputWithVariablesButton } from "@/components/inputs/DebouncedTextInput";
import type { TableListItemProps } from "@/components/TableList";

export const QueryParamsInputs = (props: TableListItemProps<KeyValue>) => (
  <KeyValueInputs
    {...props}
    keyPlaceholder="e.g. email"
    valuePlaceholder="e.g. {{Email}}"
  />
);

export const HeadersInputs = (props: TableListItemProps<KeyValue>) => (
  <KeyValueInputs
    {...props}
    keyPlaceholder="e.g. Content-Type"
    valuePlaceholder="e.g. application/json"
  />
);

export const KeyValueInputs = ({
  item,
  onItemChange,
  keyPlaceholder,
  valuePlaceholder,
}: TableListItemProps<KeyValue> & {
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}) => {
  const handleKeyChange = (key: string) => {
    if (key === item.key) return;
    onItemChange({ ...item, key });
  };
  const handleValueChange = (value: string) => {
    if (value === item.value) return;
    onItemChange({ ...item, value });
  };
  return (
    <div className="flex flex-col gap-2 p-4 rounded-md flex-1 border">
      <Field.Root>
        <Field.Label>Key:</Field.Label>
        <DebouncedTextInputWithVariablesButton
          defaultValue={item.key ?? ""}
          onValueChange={handleKeyChange}
          placeholder={keyPlaceholder}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>Value:</Field.Label>
        <DebouncedTextInputWithVariablesButton
          defaultValue={item.value ?? ""}
          onValueChange={handleValueChange}
          placeholder={valuePlaceholder}
        />
      </Field.Root>
    </div>
  );
};
