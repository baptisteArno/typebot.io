import { StartParams, Variable } from '@typebot.io/schemas'
import { safeStringify } from './safeStringify'

export const prefillVariables = (
  variables: Variable[],
  prefilledVariables: NonNullable<StartParams['prefilledVariables']>
): Variable[] =>
  variables.map((variable) => {
    const prefilledVariable = prefilledVariables[variable.name]
    if (!prefilledVariable) return variable
    return {
      ...variable,
      value: safeStringify(prefilledVariable),
    }
  })
