import { executeCondition } from '@typebot.io/logic/executeCondition'
import { PictureChoiceBlock, Variable } from '@typebot.io/schemas'

export const filterPictureChoiceItems =
  (variables: Variable[]) =>
  (block: PictureChoiceBlock): PictureChoiceBlock => {
    const filteredItems = block.items.filter((item) => {
      if (item.displayCondition?.isEnabled && item.displayCondition?.condition)
        return executeCondition({
          variables,
          condition: item.displayCondition.condition,
        })

      return true
    })
    return {
      ...block,
      items: filteredItems,
    }
  }
