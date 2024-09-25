import { DropdownList } from "@/components/DropdownList";
import type { TableListItemProps } from "@/components/TableList";
import { TextInput } from "@/components/inputs";
import { VariableSearchInput } from "@/components/inputs/VariableSearchInput";
import { Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { ComparisonOperators } from "@typebot.io/conditions/constants";
import type { Comparison } from "@typebot.io/conditions/schemas";
import type { Variable } from "@typebot.io/variables/schemas";

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
    comparisonOperator: ComparisonOperators,
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
      <VariableSearchInput
        initialVariableId={item.variableId}
        onSelectVariable={handleSelectVariable}
        placeholder={t("variables.search")}
      />
      <DropdownList
        currentItem={item.comparisonOperator}
        onItemSelect={handleSelectComparisonOperator}
        items={Object.values(ComparisonOperators)}
        placeholder={t(
          "blocks.inputs.button.buttonSettings.displayCondition.selectOperator.label",
        )}
      />
      {item.comparisonOperator !== ComparisonOperators.IS_SET &&
        item.comparisonOperator !== ComparisonOperators.IS_EMPTY && (
          <TextInput
            defaultValue={item.value ?? ""}
            onChange={handleChangeValue}
            placeholder={parseValuePlaceholder(item.comparisonOperator)}
          />
        )}
    </Stack>
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
      return "Type a number...";
    case ComparisonOperators.IS_SET:
    case ComparisonOperators.IS_EMPTY:
      return "";
    case ComparisonOperators.MATCHES_REGEX:
    case ComparisonOperators.NOT_MATCH_REGEX:
      return "/^[0-9]+$/";
  }
};
