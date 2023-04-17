import { isDefined } from '@typebot.io/lib'
import { Variable, VariableWithValue } from '@typebot.io/schemas'
import { safeStringify } from './safeStringify'

export type ParseVariablesOptions = {
  fieldToParse?: 'value' | 'id'
  escapeForJson?: boolean
  takeLatestIfList?: boolean
  escapeHtml?: boolean
}

export const defaultParseVariablesOptions: ParseVariablesOptions = {
  fieldToParse: 'value',
  escapeForJson: false,
  takeLatestIfList: false,
  escapeHtml: false,
}

export const parseVariables =
  (
    variables: Variable[],
    options: ParseVariablesOptions = defaultParseVariablesOptions
  ) =>
  (text: string | undefined): string => {
    if (!text || text === '') return ''
    // Capture {{variable}} and ${{{variable}}} (variables in template litterals)
    const pattern = /\{\{([^{}]+)\}\}|(\$)\{\{([^{}]+)\}\}/g
    return text.replace(
      pattern,
      (_full, nameInCurlyBraces, _dollarSign, nameInTemplateLitteral) => {
        const dollarSign = _dollarSign ?? ''
        const matchedVarName = nameInCurlyBraces ?? nameInTemplateLitteral
        const variable = variables.find((variable) => {
          return (
            matchedVarName === variable.name &&
            (options.fieldToParse === 'id' || isDefined(variable.value))
          )
        }) as VariableWithValue | undefined
        if (!variable) return dollarSign + ''
        if (options.fieldToParse === 'id') return dollarSign + variable.id
        const { value } = variable
        if (options.escapeForJson)
          return (
            dollarSign +
            jsonParse(typeof value !== 'string' ? JSON.stringify(value) : value)
          )
        const parsedValue =
          dollarSign +
          safeStringify(
            options.takeLatestIfList && Array.isArray(value)
              ? value[value.length - 1]
              : value
          )
        if (!parsedValue) return dollarSign + ''
        if (options.escapeHtml)
          return parsedValue.replace(/</g, '&lt;').replace(/>/g, '&gt;')
        return parsedValue
      }
    )
  }

const jsonParse = (str: string) =>
  str
    .replace(/\n/g, `\\n`)
    .replace(/"/g, `\\"`)
    .replace(/\\[^n"]/g, `\\\\ `)
