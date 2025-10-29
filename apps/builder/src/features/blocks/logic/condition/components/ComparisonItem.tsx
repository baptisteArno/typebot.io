import { useTranslate } from "@tolgee/react";
import { ComparisonOperators } from "@typebot.io/conditions/constants";
import type { Comparison } from "@typebot.io/conditions/schemas";
import type { Variable } from "@typebot.io/variables/schemas";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { DebouncedTextInputWithVariablesButton } from "@/components/inputs/DebouncedTextInput";
import { VariablesCombobox } from "@/components/inputs/VariablesCombobox";
import type { TableListItemProps } from "@/components/TableList";

export const ComparisonItem = ({
  item,
  onItemChange,
}: TableListItemProps<Comparison>) => {
  const { t } = useTranslate();

  const handleSelectVariable = (variable?: Variable) => {
    if (variable?.id === item.variableId) return;
    onItemChange({ ...item, variableId: variable?.id });
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
    <div className="flex flex-col gap-2 p-4 rounded-md flex-1 border">
      <VariablesCombobox
        initialVariableId={item.variableId}
        onSelectVariable={handleSelectVariable}
      />
      <BasicSelect
        value={item.comparisonOperator}
        onChange={handleSelectComparisonOperator}
        items={Object.values(ComparisonOperators)}
        placeholder={t(
          "blocks.inputs.button.buttonSettings.displayCondition.selectOperator.label",
        )}
      />
      {item.comparisonOperator !== ComparisonOperators.IS_SET &&
        item.comparisonOperator !== ComparisonOperators.IS_EMPTY && (
          <DebouncedTextInputWithVariablesButton
            defaultValue={item.value ?? ""}
            onValueChange={handleChangeValue}
            placeholder={parseValuePlaceholder(item.comparisonOperator)}
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
      return "/^[0-9]+$/";
  }
};
