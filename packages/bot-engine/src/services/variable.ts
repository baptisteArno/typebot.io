import { Variable } from 'models'
import { isDefined, isNotDefined } from 'utils'

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
    const evaluatedResult = Function('return' + str)()
    return isNotDefined(evaluatedResult) ? '' : evaluatedResult.toString()
  } catch (err) {
    console.log(err)
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
