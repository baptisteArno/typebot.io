import {
  VariableWithValue,
  PictureChoiceBlock,
  Variable,
} from '@typebot.io/schemas'
import { isDefined } from '@typebot.io/lib'
import { filterPictureChoiceItems } from './filterPictureChoiceItems'
import { deepParseVariables } from '@typebot.io/variables/deepParseVariables'

export const injectVariableValuesInPictureChoiceBlock =
  (variables: Variable[]) =>
  (block: PictureChoiceBlock): PictureChoiceBlock => {
    if (
      block.options?.dynamicItems?.isEnabled &&
      block.options.dynamicItems.pictureSrcsVariableId
    ) {
      const pictureSrcsVariable = variables.find(
        (variable) =>
          variable.id === block.options?.dynamicItems?.pictureSrcsVariableId &&
          isDefined(variable.value)
      ) as VariableWithValue | undefined
      if (!pictureSrcsVariable) return deepParseVariables(variables)(block)
      const titlesVariable = block.options.dynamicItems.titlesVariableId
        ? (variables.find(
            (variable) =>
              variable.id === block.options?.dynamicItems?.titlesVariableId &&
              isDefined(variable.value)
          ) as VariableWithValue | undefined)
        : undefined
      const titlesVariableValues =
        typeof titlesVariable?.value === 'string'
          ? [titlesVariable.value]
          : titlesVariable?.value
      const descriptionsVariable = block.options.dynamicItems
        .descriptionsVariableId
        ? (variables.find(
            (variable) =>
              variable.id ===
                block.options?.dynamicItems?.descriptionsVariableId &&
              isDefined(variable.value)
          ) as VariableWithValue | undefined)
        : undefined
      const descriptionsVariableValues =
        typeof descriptionsVariable?.value === 'string'
          ? [descriptionsVariable.value]
          : descriptionsVariable?.value

      const variableValues =
        typeof pictureSrcsVariable.value === 'string'
          ? [pictureSrcsVariable.value]
          : pictureSrcsVariable.value

      return {
        ...deepParseVariables(variables)(block),
        items: variableValues.filter(isDefined).map((pictureSrc, idx) => ({
          id: idx.toString(),
          blockId: block.id,
          pictureSrc,
          title: titlesVariableValues?.[idx] ?? '',
          description: descriptionsVariableValues?.[idx] ?? '',
        })),
      }
    }
    return deepParseVariables(variables)(
      filterPictureChoiceItems(variables)(block)
    )
  }
