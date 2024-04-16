import { safeStringify } from '@typebot.io/lib/safeStringify'
import { createId } from '@paralleldrive/cuid2'
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

export const prefillAddVariables = (
    variables: Variable[],
    prefilledVariables: Record<string, any>
  ): Variable[] => {
    var ret = variables.map((variable) => {
      const prefilledVariable = prefilledVariables[variable.name]
      if (!prefilledVariable) return variable
      prefilledVariables[variable.name] = null
      return {
        ...variable,
        value: safeStringify(prefilledVariable),
      }
    })
    var rest = Object.keys(prefilledVariables)
      .filter((k) => prefilledVariables[k] !== null)
      .map((k) => {
        return <Variable>{
          id: 'v' + createId(),
          name: k,
          value: safeStringify(prefilledVariables[k]),
        }
      })
  
    return ret.concat(rest)
  }
