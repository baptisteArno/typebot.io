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

export const isMathFormula = (str?: string) =>
  ['*', '/', '+', '-'].some((val) => str && str.includes(val))

export const evaluateExpression = (str: string) => {
  const result = replaceCommasWithDots(str)
  try {
    const evaluatedNumber = safeEval(result) as number
    if (countDecimals(evaluatedNumber) > 2) {
      return evaluatedNumber.toFixed(2)
    }
    return evaluatedNumber.toString()
  } catch (err) {
    return result
  }
}

const replaceCommasWithDots = (str: string) =>
  str.replace(new RegExp(/(\d+)(,)(\d+)/, 'g'), '$1.$3')

const countDecimals = (value: number) => {
  if (value % 1 != 0) return value.toString().split('.')[1].length
  return 0
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
