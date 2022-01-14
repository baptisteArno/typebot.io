import { Table, Variable } from 'models'
import { isDefined } from 'utils'

const safeEval = eval

export const stringContainsVariable = (str: string): boolean =>
  /\{\{(.*?)\}\}/g.test(str)

export const parseVariables = (
  text: string,
  variables: Table<Variable>
): string => {
  if (text === '') return text
  return text.replace(/\{\{(.*?)\}\}/g, (_, fullVariableString) => {
    const matchedVarName = fullVariableString.replace(/{{|}}/g, '')
    const matchedVariableId = variables.allIds.find((variableId) => {
      const variable = variables.byId[variableId]
      return matchedVarName === variable.name && isDefined(variable.value)
    })
    return variables.byId[matchedVariableId ?? '']?.value ?? ''
  })
}

export const isMathFormula = (str?: string) =>
  ['*', '/', '+', '-'].some((val) => str && str.includes(val))

export const evaluateExpression = (str: string) => {
  let result = replaceCommasWithDots(str)
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
