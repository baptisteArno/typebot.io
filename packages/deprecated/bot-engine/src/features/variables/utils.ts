import { Variable, VariableWithValue } from '@typebot.io/schemas'
import { isDefined, isNotDefined } from '@typebot.io/lib'

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
      const variable = variables.find((variable) => {
        return (
          matchedVarName === variable.name &&
          (options.fieldToParse === 'id' || isDefined(variable.value))
        )
      }) as VariableWithValue | undefined
      if (!variable) return ''
      if (options.fieldToParse === 'id') return variable.id
      const { value } = variable
      if (options.escapeForJson)
        return typeof value === 'string'
          ? jsonParse(value)
          : jsonParse(JSON.stringify(value))
      const parsedValue = safeStringify(value)
      if (!parsedValue) return ''
      return parsedValue
    })
  }

export const safeStringify = (val: unknown): string | null => {
  if (isNotDefined(val)) return null
  if (typeof val === 'string') return val
  try {
    return JSON.stringify(val)
  } catch {
    console.warn('Failed to safely stringify variable value', val)
    return null
  }
}

export const parseCorrectValueType = (
  value: Variable['value']
): string | (string | null)[] | boolean | number | null | undefined => {
  if (value === null) return null
  if (value === undefined) return undefined
  if (Array.isArray(value)) return value
  if (typeof value === 'number') return value
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === 'null') return null
  if (value === 'undefined') return undefined
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

const jsonParse = (str: string) =>
  str
    .replace(/\n/g, `\\n`)
    .replace(/"/g, `\\"`)
    .replace(/\\[^n"]/g, `\\\\ `)

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
