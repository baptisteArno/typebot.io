import { safeStringify } from '@typebot.io/lib/safeStringify'
import { StartChatInput, Variable } from '@typebot.io/schemas'

export const prefillVariables = (
  variables: Variable[],
  prefilledVariables: NonNullable<StartChatInput['prefilledVariables']>
): Variable[] =>
  variables.map((variable) => {
    const prefilledVariable = prefilledVariables[variable.name]
    if (!prefilledVariable) return variable
    return {
      ...variable,
      value: safeStringify(prefilledVariable),
    }
  })
