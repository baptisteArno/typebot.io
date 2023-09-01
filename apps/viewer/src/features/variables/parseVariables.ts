import { isDefined } from '@typebot.io/lib'
import { Variable, VariableWithValue } from '@typebot.io/schemas'
import { safeStringify } from '@typebot.io/lib/safeStringify'

export type ParseVariablesOptions = {
  fieldToParse?: 'value' | 'id'
  isInsideJson?: boolean
  takeLatestIfList?: boolean
  isInsideHtml?: boolean
}

export const defaultParseVariablesOptions: ParseVariablesOptions = {
  fieldToParse: 'value',
  isInsideJson: false,
  takeLatestIfList: false,
  isInsideHtml: false,
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
        const dollarSign = (_dollarSign ?? '') as string
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
        if (options.isInsideJson)
          return dollarSign + parseVariableValueInJson(value)
        const parsedValue =
          dollarSign +
          safeStringify(
            options.takeLatestIfList && Array.isArray(value)
              ? value[value.length - 1]
              : value
          )
        if (!parsedValue) return dollarSign + ''
        if (options.isInsideHtml) return parseVariableValueInHtml(parsedValue)
        return parsedValue
      }
    )
  }

const parseVariableValueInJson = (value: VariableWithValue['value']) => {
  const stringifiedValue = JSON.stringify(value)
  if (typeof value === 'string') return stringifiedValue.slice(1, -1)
  return stringifiedValue
}

const parseVariableValueInHtml = (
  value: VariableWithValue['value']
): string => {
  if (typeof value === 'string')
    return value.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return JSON.stringify(value).replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
