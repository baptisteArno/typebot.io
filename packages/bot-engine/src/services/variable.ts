import { Variable } from 'models'
import { isDefined } from 'utils'

const safeEval = eval

export const stringContainsVariable = (str: string): boolean =>
  /\{\{(.*?)\}\}/g.test(str)

export const parseVariables =
  (variables: Variable[]) =>
  (text?: string): string => {
    if (!text || text === '') return ''
    return text.replace(/\{\{(.*?)\}\}/g, (_, fullVariableString) => {
      const matchedVarName = fullVariableString.replace(/{{|}}/g, '')
      return (
        variables.find((v) => {
          return matchedVarName === v.name && isDefined(v.value)
        })?.value ?? ''
      )
    })
  }

export const evaluateExpression = (str: string) => {
  try {
    const evaluatedResult = safeEval(str)
    return evaluatedResult.toString()
  } catch (err) {
    return str
  }
}

export const parseVariablesInObject = (
  object: { [key: string]: string | number },
  variables: Variable[]
) =>
  Object.keys(object).reduce((newObj, key) => {
    const currentValue = object[key]
    return {
      ...newObj,
      [key]:
        typeof currentValue === 'string'
          ? parseVariables(variables)(currentValue)
          : currentValue,
    }
  }, {})
