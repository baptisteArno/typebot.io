import { executeCondition } from '@typebot.io/logic/executeCondition'
import { ChoiceInputBlock, Variable } from '@typebot.io/schemas'

export const filterChoiceItems =
  (variables: Variable[]) =>
  (block: ChoiceInputBlock): ChoiceInputBlock => {
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
