import { parseVariables } from "@/features/variables";
import type { EdgeId, LogicState } from "@/types";
import type { ConditionBlock } from "@typebot.io/blocks-logic/condition/schema";
import {
  ComparisonOperators,
  LogicalOperator,
} from "@typebot.io/conditions/constants";
import type { Comparison } from "@typebot.io/conditions/schemas";
import { isDefined, isNotDefined } from "@typebot.io/lib/utils";
import type { Variable } from "@typebot.io/variables/schemas";

export const executeCondition = (
  block: ConditionBlock,
  { typebot: { variables } }: LogicState,
): EdgeId | undefined => {
  const passedCondition = block.items.find((item) => {
    const { content } = item;
    const isConditionPassed =
      content?.logicalOperator === LogicalOperator.AND
        ? content.comparisons?.every(executeComparison(variables))
        : content?.comparisons?.some(executeComparison(variables));
    return isConditionPassed;
  });
  return passedCondition
    ? passedCondition.outgoingEdgeId
    : block.outgoingEdgeId;
};

const executeComparison =
  (variables: Variable[]) => (comparison: Comparison) => {
    if (!comparison?.variableId) return false;
    const inputValue = (
      variables.find((v) => v.id === comparison.variableId)?.value ?? ""
    )
      .toString()
      .trim();
    const value = parseVariables(variables)(comparison.value).trim();
    if (isNotDefined(value) || !comparison.comparisonOperator) return false;
    return matchComparison(inputValue, comparison.comparisonOperator, value);
  };

const matchComparison = (
  inputValue: string,
  comparisonOperator: ComparisonOperators,
  value: string,
) => {
  switch (comparisonOperator) {
    case ComparisonOperators.CONTAINS: {
      return inputValue.toLowerCase().includes(value.toLowerCase());
    }
    case ComparisonOperators.EQUAL: {
      return inputValue === value;
    }
    case ComparisonOperators.NOT_EQUAL: {
      return inputValue !== value;
    }
    case ComparisonOperators.GREATER: {
      return Number.parseFloat(inputValue) > Number.parseFloat(value);
    }
    case ComparisonOperators.LESS: {
      return Number.parseFloat(inputValue) < Number.parseFloat(value);
    }
    case ComparisonOperators.IS_SET: {
      return isDefined(inputValue) && inputValue.length > 0;
    }
  }
};
