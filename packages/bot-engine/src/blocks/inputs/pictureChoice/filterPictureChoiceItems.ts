import type { PictureChoiceBlock } from "@typebot.io/blocks-inputs/pictureChoice/schema";
import { executeCondition } from "@typebot.io/conditions/executeCondition";
import type { Variable } from "@typebot.io/variables/schemas";

export const filterPictureChoiceItems =
  (variables: Variable[]) =>
  (block: PictureChoiceBlock): PictureChoiceBlock => {
    const filteredItems = block.items.filter((item) => {
      if (item.displayCondition?.isEnabled && item.displayCondition?.condition)
        return executeCondition({
          variables,
          condition: item.displayCondition.condition,
        });

      return true;
    });
    return {
      ...block,
      items: filteredItems,
    };
  };
