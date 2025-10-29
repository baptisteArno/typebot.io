import { ComparisonOperators } from "@typebot.io/conditions/constants";
import type { WhatsAppComparison } from "@typebot.io/whatsapp/schemas";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { DebouncedTextInput } from "@/components/inputs/DebouncedTextInput";
import type { TableListItemProps } from "@/components/TableList";

export const WhatsAppComparisonItem = ({
  item,
  onItemChange,
}: TableListItemProps<WhatsAppComparison>) => {
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
    <div className="flex items-center gap-2 p-4 rounded-md flex-1 border">
      <p className="shrink-0">User message</p>
      <BasicSelect
        value={item.comparisonOperator}
        onChange={handleSelectComparisonOperator}
        items={Object.values(ComparisonOperators)}
        placeholder="Select an operator"
      />
      {item.comparisonOperator !== ComparisonOperators.IS_SET &&
        item.comparisonOperator !== ComparisonOperators.IS_EMPTY && (
          <DebouncedTextInput
            defaultValue={item.value ?? ""}
            onValueChange={handleChangeValue}
            placeholder={parseValuePlaceholder(item.comparisonOperator)}
            size="sm"
          />
        )}
    </div>
  );
};

const parseValuePlaceholder = (
  operator: ComparisonOperators | undefined,
): string => {
  switch (operator) {
    case ComparisonOperators.NOT_EQUAL:
    case ComparisonOperators.EQUAL:
    case ComparisonOperators.CONTAINS:
    case ComparisonOperators.STARTS_WITH:
    case ComparisonOperators.ENDS_WITH:
    case ComparisonOperators.NOT_CONTAINS:
    case undefined:
      return "Type a value...";
    case ComparisonOperators.LESS:
    case ComparisonOperators.GREATER:
    case ComparisonOperators.LESS_OR_EQUAL:
    case ComparisonOperators.GREATER_OR_EQUAL:
      return "Type a number...";
    case ComparisonOperators.IS_SET:
    case ComparisonOperators.IS_EMPTY:
      return "";
    case ComparisonOperators.MATCHES_REGEX:
    case ComparisonOperators.NOT_MATCH_REGEX:
      return "^[0-9]+$";
  }
};
