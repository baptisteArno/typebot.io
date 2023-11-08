import { isDefined } from '@typebot.io/lib/utils'
import { InputBlock } from '@typebot.io/schemas'
import { Variable } from '@typebot.io/schemas/features/typebot/variable'

export const getPrefilledInputValue =
  (variables: Variable[]) => (block: InputBlock) => {
    const variableValue = variables.find(
      (variable) =>
        variable.id === block.options?.variableId && isDefined(variable.value)
    )?.value
    if (!variableValue || Array.isArray(variableValue)) return
    return variableValue
  }
