import type { ChoiceInputBlock } from "@typebot.io/blocks-inputs/choice/schema";
import { defaultConditionItemContent } from "@typebot.io/blocks-logic/condition/constants";
import { executeCondition } from "@typebot.io/conditions/executeCondition";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import type { Variable } from "@typebot.io/variables/schemas";

export const filterChoiceItems = (
  block: ChoiceInputBlock,
  {
    sessionStore,
    variables,
  }: { sessionStore: SessionStore; variables: Variable[] },
): ChoiceInputBlock => {
  const filteredItems = block.items.filter((item) => {
    if (item.displayCondition?.isEnabled && item.displayCondition?.condition)
      return executeCondition(
        {
          ...item.displayCondition.condition,
          logicalOperator:
            item.displayCondition.condition.logicalOperator ??
            defaultConditionItemContent.logicalOperator,
        },
        {
          variables,
          sessionStore,
        },
      );

    return true;
  });
  return {
    ...block,
    items: filteredItems,
  };
};
