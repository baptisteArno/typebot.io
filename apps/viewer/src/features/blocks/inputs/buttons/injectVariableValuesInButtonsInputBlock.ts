import {
  SessionState,
  VariableWithValue,
  ChoiceInputBlock,
  ItemType,
} from '@typebot.io/schemas'
import { isDefined } from '@typebot.io/lib'
import { deepParseVariables } from '@/features/variables/deepParseVariable'
import { transformStringVariablesToList } from '@/features/variables/transformVariablesToList'
import { updateVariables } from '@/features/variables/updateVariables'
import { filterChoiceItems } from './filterChoiceItems'

export const injectVariableValuesInButtonsInputBlock =
  (state: SessionState) =>
  async (block: ChoiceInputBlock): Promise<ChoiceInputBlock> => {
    if (block.options.dynamicVariableId) {
      const variable = state.typebot.variables.find(
        (variable) =>
          variable.id === block.options.dynamicVariableId &&
          isDefined(variable.value)
      ) as VariableWithValue | undefined
      if (!variable) return block
      const value = await getVariableValue(state)(variable)
      return {
        ...block,
        items: value.filter(isDefined).map((item, idx) => ({
          id: idx.toString(),
          type: ItemType.BUTTON,
          blockId: block.id,
          content: item,
        })),
      }
    }
    return deepParseVariables(state.typebot.variables)(
      filterChoiceItems(state.typebot.variables)(block)
    )
  }

const getVariableValue =
  (state: SessionState) =>
  async (variable: VariableWithValue): Promise<(string | null)[]> => {
    if (!Array.isArray(variable.value)) {
      const [transformedVariable] = transformStringVariablesToList(
        state.typebot.variables
      )([variable.id])
      await updateVariables(state)([transformedVariable])
      return transformedVariable.value as string[]
    }
    return variable.value
  }
