import { deepParseVariable } from '@/features/variables/utils'
import {
  SessionState,
  VariableWithValue,
  ChoiceInputBlock,
  ItemType,
} from '@typebot.io/schemas'
import { isDefined } from '@typebot.io/lib'

export const injectVariableValuesInButtonsInputBlock =
  (variables: SessionState['typebot']['variables']) =>
  (block: ChoiceInputBlock): ChoiceInputBlock => {
    if (block.options.dynamicVariableId) {
      const variable = variables.find(
        (variable) =>
          variable.id === block.options.dynamicVariableId &&
          isDefined(variable.value)
      ) as VariableWithValue | undefined
      if (!variable || typeof variable.value === 'string') return block
      return {
        ...block,
        items: variable.value.map((item, idx) => ({
          id: idx.toString(),
          type: ItemType.BUTTON,
          blockId: block.id,
          content: item,
        })),
      }
    }
    return deepParseVariable(variables)(block)
  }
