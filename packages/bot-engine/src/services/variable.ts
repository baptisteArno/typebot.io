import { Variable } from 'models'
import { isDefined, isNotDefined } from 'utils'

export const stringContainsVariable = (str: string): boolean =>
  /\{\{(.*?)\}\}/g.test(str)

export const parseVariables =
  (
    variables: Variable[],
    options: { fieldToParse?: 'value' | 'id'; escapeForJson?: boolean } = {
      fieldToParse: 'value',
      escapeForJson: false,
    }
  ) =>
  (text: string | undefined): string => {
    if (!text || text === '') return ''
    return text.replace(/\{\{(.*?)\}\}/g, (_, fullVariableString) => {
      const matchedVarName = fullVariableString.replace(/{{|}}/g, '')
      const variable = variables.find((v) => {
        return matchedVarName === v.name && isDefined(v.value)
      })
      if (!variable) return ''
      if (options.fieldToParse === 'id') return variable.id
      const { value } = variable
      if (isNotDefined(value)) return ''
      if (options.escapeForJson) return jsonParse(value.toString())
      return value.toString()
    })
  }

const jsonParse = (str: string) =>
  str
    .replace(/\n/g, `\\n`)
    .replace(/"/g, `\\"`)
    .replace(/\\[^n"]/g, `\\\\ `)

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
