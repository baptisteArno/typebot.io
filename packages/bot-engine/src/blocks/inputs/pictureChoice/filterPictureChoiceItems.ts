import type { PictureChoiceBlock } from "@typebot.io/blocks-inputs/pictureChoice/schema";
import { executeCondition } from "@typebot.io/conditions/executeCondition";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import type { Variable } from "@typebot.io/variables/schemas";

export const filterPictureChoiceItems = (
  block: PictureChoiceBlock,
  {
    sessionStore,
    variables,
  }: { sessionStore: SessionStore; variables: Variable[] },
): PictureChoiceBlock => {
  const filteredItems = block.items.filter((item) => {
    if (item.displayCondition?.isEnabled && item.displayCondition?.condition)
      return executeCondition(item.displayCondition.condition, {
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
