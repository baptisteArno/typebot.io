import type { ChoiceInputBlock } from "@typebot.io/blocks-inputs/choice/schema";
import { defaultConditionItemContent } from "@typebot.io/blocks-logic/condition/constants";
import { executeCondition } from "@typebot.io/conditions/executeCondition";
import type { Variable } from "@typebot.io/variables/schemas";

export const filterChoiceItems =
  (variables: Variable[]) =>
  (block: ChoiceInputBlock): ChoiceInputBlock => {
    const filteredItems = block.items.filter((item) => {
      if (item.displayCondition?.isEnabled && item.displayCondition?.condition)
        return executeCondition({
          variables,
          condition: {
            ...item.displayCondition.condition,
            logicalOperator:
              item.displayCondition.condition.logicalOperator ??
              defaultConditionItemContent.logicalOperator,
          },
        });

      return true;
    });
    return {
      ...block,
      items: filteredItems,
    };
  };
