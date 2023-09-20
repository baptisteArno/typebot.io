import { ChoiceInputBlock, Variable } from '@typebot.io/schemas'
import { executeCondition } from '../../logic/condition/executeCondition'

export const filterChoiceItems =
  (variables: Variable[]) =>
  (block: ChoiceInputBlock): ChoiceInputBlock => {
    const filteredItems = block.items.filter((item) => {
      if (item.displayCondition?.isEnabled && item.displayCondition?.condition)
        return executeCondition(variables)(item.displayCondition.condition)

      return true
    })
    return {
      ...block,
      items: filteredItems,
    }
  }
