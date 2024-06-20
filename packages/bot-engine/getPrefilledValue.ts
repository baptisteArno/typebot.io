import { isDefined } from '@sniper.io/lib/utils'
import { InputBlock } from '@sniper.io/schemas'
import { Variable } from '@sniper.io/schemas/features/sniper/variable'

export const getPrefilledInputValue =
  (variables: Variable[]) => (block: InputBlock) => {
    const variableValue = variables.find(
      (variable) =>
        variable.id === block.options?.variableId && isDefined(variable.value)
    )?.value
    if (!variableValue || Array.isArray(variableValue)) return
    return variableValue
  }
