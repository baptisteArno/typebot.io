import { safeStringify } from '@typebot.io/lib/safeStringify'
import { Variable } from './types'

export const prefillVariables = (
  variables: Variable[],
  prefilledVariables: Record<string, any>
): Variable[] =>
  variables.map((variable) => {
    const prefilledVariable = prefilledVariables[variable.name]
    if (!prefilledVariable) return variable
    return {
      ...variable,
      value: Array.isArray(prefilledVariable)
        ? prefilledVariable.map(safeStringify)
        : safeStringify(prefilledVariable),
    }
  })
