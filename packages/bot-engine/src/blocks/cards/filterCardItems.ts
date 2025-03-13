import type { CardsBlock } from "@typebot.io/blocks-inputs/cards/schema";
import { executeCondition } from "@typebot.io/conditions/executeCondition";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import type { Variable } from "@typebot.io/variables/schemas";

export const filterCardsItems = (
  block: CardsBlock,
  {
    sessionStore,
    variables,
  }: { sessionStore: SessionStore; variables: Variable[] },
) => {
  const filteredItems = block.items.filter((item) => {
    if (
      item.options?.displayCondition?.isEnabled &&
      item.options?.displayCondition?.condition
    )
      return executeCondition(item.options.displayCondition.condition, {
        variables,
        sessionStore,
      });

    return true;
  });
  return {
    ...block,
    items: filteredItems,
  };
};
