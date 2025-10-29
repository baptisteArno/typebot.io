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
    <div className="flex flex-col gap-2">
      {condition?.comparisons?.map((comparison, idx) => {
        const variable = variables.find(byId(comparison.variableId));
        return (
          <div className="flex flex-wrap gap-1 truncate" key={comparison.id}>
            {idx === 0 && (
              <p className={size === "xs" ? "text-xs" : "text-sm"}>
                {t("blocks.inputs.button.conditionContent.if.label")}
              </p>
            )}
            {idx > 0 && (
              <p className={size === "xs" ? "text-xs" : "text-sm"}>
                {condition.logicalOperator ??
                  defaultConditionItemContent.logicalOperator}
              </p>
            )}
            {variable?.name && (
              <Badge colorScheme="purple" className="break-all">
                {variable.name}
              </Badge>
            )}
            {comparison.comparisonOperator && (
              <p className={size === "xs" ? "text-xs" : "text-sm"}>
                {parseComparisonOperatorSymbol(comparison.comparisonOperator)}
              </p>
            )}
            {comparison?.value &&
              comparison.comparisonOperator !== ComparisonOperators.IS_SET &&
              comparison.comparisonOperator !==
                ComparisonOperators.IS_EMPTY && (
                <Badge>{comparison.value}</Badge>
              )}
            {idx === (condition.comparisons?.length ?? 0) - 1 &&
              displaySemicolon && (
                <p className={size === "xs" ? "text-xs" : "text-sm"}>:</p>
              )}
          </div>
        );
      })}
    </div>
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
