import { isDefined } from '@typebot.io/lib'
import { Variable, VariableWithValue } from '@typebot.io/schemas'
import { safeStringify } from './safeStringify'

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
        return jsonParse(
          typeof value !== 'string' ? JSON.stringify(value) : value
        )
      const parsedValue = safeStringify(value)
      if (!parsedValue) return ''
      return parsedValue
    })
  }

const jsonParse = (str: string) =>
  str
    .replace(/\n/g, `\\n`)
    .replace(/"/g, `\\"`)
    .replace(/\\[^n"]/g, `\\\\ `)
