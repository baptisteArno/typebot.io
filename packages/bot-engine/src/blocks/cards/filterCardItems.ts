import type { CardsBlock } from "@typebot.io/blocks-inputs/cards/schema";
import { executeCondition } from "@typebot.io/conditions/executeCondition";
import type { Variable } from "@typebot.io/variables/schemas";

export const filterCardsItems =
  (variables: Variable[]) =>
  (block: CardsBlock): CardsBlock => {
    const filteredItems = block.items.filter((item) => {
      if (
        item.options?.displayCondition?.isEnabled &&
        item.options?.displayCondition?.condition
      )
        return executeCondition({
          variables,
          condition: item.options.displayCondition.condition,
        });

      return true;
    });
    return {
      ...block,
      items: filteredItems,
    };
  };
