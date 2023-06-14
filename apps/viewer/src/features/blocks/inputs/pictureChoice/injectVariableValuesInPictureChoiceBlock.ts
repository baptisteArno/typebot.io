import {
  SessionState,
  VariableWithValue,
  ItemType,
  PictureChoiceBlock,
} from '@typebot.io/schemas'
import { isDefined } from '@typebot.io/lib'
import { deepParseVariables } from '@/features/variables/deepParseVariable'
import { filterPictureChoiceItems } from './filterPictureChoiceItems'

export const injectVariableValuesInPictureChoiceBlock =
  (variables: SessionState['typebot']['variables']) =>
  (block: PictureChoiceBlock): PictureChoiceBlock => {
    if (
      block.options.dynamicItems?.isEnabled &&
      block.options.dynamicItems.pictureSrcsVariableId
    ) {
      const pictureSrcsVariable = variables.find(
        (variable) =>
          variable.id === block.options.dynamicItems?.pictureSrcsVariableId &&
          isDefined(variable.value)
      ) as VariableWithValue | undefined
      if (!pictureSrcsVariable || typeof pictureSrcsVariable.value === 'string')
        return block
      const titlesVariable = block.options.dynamicItems.titlesVariableId
        ? (variables.find(
            (variable) =>
              variable.id === block.options.dynamicItems?.titlesVariableId &&
              isDefined(variable.value)
          ) as VariableWithValue | undefined)
        : undefined
      const descriptionsVariable = block.options.dynamicItems
        .descriptionsVariableId
        ? (variables.find(
            (variable) =>
              variable.id ===
                block.options.dynamicItems?.descriptionsVariableId &&
              isDefined(variable.value)
          ) as VariableWithValue | undefined)
        : undefined
      return {
        ...block,
        items: pictureSrcsVariable.value
          .filter(isDefined)
          .map((pictureSrc, idx) => ({
            id: idx.toString(),
            type: ItemType.PICTURE_CHOICE,
            blockId: block.id,
            pictureSrc,
            title: titlesVariable?.value?.[idx] ?? '',
            description: descriptionsVariable?.value?.[idx] ?? '',
          })),
      }
    }
    return deepParseVariables(variables)(
      filterPictureChoiceItems(variables)(block)
    )
  }
