import { Variable } from 'models'
import { isDefined, isNotDefined } from 'utils'

export const stringContainsVariable = (str: string): boolean =>
  /\{\{(.*?)\}\}/g.test(str)

export const parseVariables =
  (
    variables: Variable[],
    options: { fieldToParse: 'value' | 'id' } = { fieldToParse: 'value' }
  ) =>
  (text: string | undefined): string => {
    if (!text || text === '') return ''
    return text.replace(/\{\{(.*?)\}\}/g, (_, fullVariableString) => {
      const matchedVarName = fullVariableString.replace(/{{|}}/g, '')
      const variable = variables.find((v) => {
        return matchedVarName === v.name && isDefined(v.value)
      })
      if (!variable) return ''
      return (
        (options.fieldToParse === 'value'
          ? variable.value?.toString()
          : variable.id) || ''
      )
    })
  }

export const evaluateExpression = (variables: Variable[]) => (str: string) => {
  const evaluating = parseVariables(variables, { fieldToParse: 'id' })(
    str.includes('return ') ? str : `return ${str}`
  )
  try {
    const func = Function(...variables.map((v) => v.id), evaluating)
    const evaluatedResult = func(...variables.map((v) => v.value))
    return isNotDefined(evaluatedResult) ? '' : evaluatedResult
  } catch (err) {
    console.log(`Evaluating: ${evaluating}`, err)
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
