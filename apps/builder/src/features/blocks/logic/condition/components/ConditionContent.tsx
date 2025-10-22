import { Stack, Text, Wrap } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { defaultConditionItemContent } from "@typebot.io/blocks-logic/condition/constants";
import { ComparisonOperators } from "@typebot.io/conditions/constants";
import type { Condition } from "@typebot.io/conditions/schemas";
import { byId } from "@typebot.io/lib/utils";
import { Badge } from "@typebot.io/ui/components/Badge";
import type { Variable } from "@typebot.io/variables/schemas";

type Props = {
  condition: Condition | undefined;
  variables: Variable[];
  size?: "xs" | "sm";
  displaySemicolon?: boolean;
};
export const ConditionContent = ({
  condition,
  variables,
  size = "sm",
  displaySemicolon,
}: Props) => {
  const { t } = useTranslate();
  return (
    <Stack>
      {condition?.comparisons?.map((comparison, idx) => {
        const variable = variables.find(byId(comparison.variableId));
        return (
          <Wrap key={comparison.id} spacing={1} noOfLines={1}>
            {idx === 0 && (
              <Text fontSize={size}>
                {t("blocks.inputs.button.conditionContent.if.label")}
              </Text>
            )}
            {idx > 0 && (
              <Text fontSize={size}>
                {condition.logicalOperator ??
                  defaultConditionItemContent.logicalOperator}
              </Text>
            )}
            {variable?.name && (
              <Badge colorScheme="purple" className="break-all">
                {variable.name}
              </Badge>
            )}
            {comparison.comparisonOperator && (
              <Text fontSize={size}>
                {parseComparisonOperatorSymbol(comparison.comparisonOperator)}
              </Text>
            )}
            {comparison?.value &&
              comparison.comparisonOperator !== ComparisonOperators.IS_SET &&
              comparison.comparisonOperator !==
                ComparisonOperators.IS_EMPTY && (
                <Badge>{comparison.value}</Badge>
              )}
            {idx === (condition.comparisons?.length ?? 0) - 1 &&
              displaySemicolon && <Text fontSize={size}>:</Text>}
          </Wrap>
        );
      })}
    </Stack>
  );
};

const parseComparisonOperatorSymbol = (
  operator: ComparisonOperators,
): string => {
  switch (operator) {
    case ComparisonOperators.CONTAINS:
      return "contains";
    case ComparisonOperators.EQUAL:
      return "=";
    case ComparisonOperators.GREATER:
      return ">";
    case ComparisonOperators.IS_SET:
      return "is set";
    case ComparisonOperators.LESS:
      return "<";
    case ComparisonOperators.NOT_EQUAL:
      return "!=";
    case ComparisonOperators.ENDS_WITH:
      return "ends with";
    case ComparisonOperators.STARTS_WITH:
      return "starts with";
    case ComparisonOperators.IS_EMPTY:
      return "is empty";
    case ComparisonOperators.NOT_CONTAINS:
      return "not contains";
    case ComparisonOperators.MATCHES_REGEX:
      return "matches";
    case ComparisonOperators.NOT_MATCH_REGEX:
      return "not matches";
    case ComparisonOperators.GREATER_OR_EQUAL:
      return ">=";
    case ComparisonOperators.LESS_OR_EQUAL:
      return "<=";
  }
};
