import { safeStringify } from '@typebot.io/lib/safeStringify'
import { isDefined } from '@typebot.io/lib/utils'
import { Variable } from './types'

export const prefillVariables = (
  variables: Variable[],
  prefilledVariables: Record<string, any>
): Variable[] =>
  variables.map((variable) => {
    const prefilledVariable =
      prefilledVariables[variable.name] ?? prefilledVariables[variable.id]
    if (!isDefined(prefilledVariable)) return variable
    return {
      ...variable,
      value: Array.isArray(prefilledVariable)
        ? prefilledVariable.map(safeStringify)
        : safeStringify(prefilledVariable),
    }
  })
