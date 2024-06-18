import {
  SessionState,
  VariableWithValue,
  ChoiceInputBlock,
} from '@sniper.io/schemas'
import { isDefined } from '@sniper.io/lib'
import { filterChoiceItems } from './filterChoiceItems'
import { deepParseVariables } from '@sniper.io/variables/deepParseVariables'
import { transformVariablesToList } from '@sniper.io/variables/transformVariablesToList'
import { updateVariablesInSession } from '@sniper.io/variables/updateVariablesInSession'

export const injectVariableValuesInButtonsInputBlock =
  (state: SessionState) =>
  (block: ChoiceInputBlock): ChoiceInputBlock => {
    const { variables } = state.snipersQueue[0].sniper
    if (block.options?.dynamicVariableId) {
      const variable = variables.find(
        (variable) =>
          variable.id === block.options?.dynamicVariableId &&
          isDefined(variable.value)
      ) as VariableWithValue | undefined
      if (!variable) return block
      const value = getVariableValue(state)(variable)
      return {
        ...deepParseVariables(variables)(block),
        items: value.filter(isDefined).map((item, idx) => ({
          id: 'choice' + idx.toString(),
          blockId: block.id,
          content: item,
        })),
      }
    }
    return deepParseVariables(variables)(filterChoiceItems(variables)(block))
  }

const getVariableValue =
  (state: SessionState) =>
  (variable: VariableWithValue): (string | null)[] => {
    if (!Array.isArray(variable.value)) {
      const { variables } = state.snipersQueue[0].sniper
      const [transformedVariable] = transformVariablesToList(variables)([
        variable.id,
      ])
      return transformedVariable.value as string[]
    }
    return variable.value
  }
