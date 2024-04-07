import { safeStringify } from '@typebot.io/lib/safeStringify'
import { isDefined, isNotDefined } from '@typebot.io/lib/utils'
import { parseGuessedValueType } from './parseGuessedValueType'
import { Variable, VariableWithValue } from './types'

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

// {{= inline code =}}
const inlineCodeRegex = /\{\{=(.+?)=\}\}/g

// {{variable}} and ${{{variable}}}
const variableRegex = /\{\{([^{}]+)\}\}|(\$)\{\{([^{}]+)\}\}/g

export const parseVariables =
  (
    variables: Variable[],
    options: ParseVariablesOptions = defaultParseVariablesOptions
  ) =>
  (text: string | undefined): string => {
    if (!text || text === '') return ''
    const textWithInlineCodeParsed = text.replace(
      inlineCodeRegex,
      (_full, inlineCodeToEvaluate) => {
        const value = evaluateInlineCode(inlineCodeToEvaluate, { variables })
        return safeStringify(value) ?? value
      }
    )

    return textWithInlineCodeParsed.replace(
      variableRegex,
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

const evaluateInlineCode = (
  code: string,
  { variables }: { variables: Variable[] }
) => {
  const evaluating = parseVariables(variables, { fieldToParse: 'id' })(
    code.includes('return ') ? code : `return ${code}`
  )
  try {
    const func = Function(...variables.map((v) => v.id), evaluating)
    return func(...variables.map((v) => parseGuessedValueType(v.value)))
  } catch (err) {
    return parseVariables(variables)(code)
  }
}

type VariableToParseInformation = {
  startIndex: number
  endIndex: number
  textToReplace: string
  value: string
}

export const getVariablesToParseInfoInText = (
  text: string,
  {
    variables,
    takeLatestIfList,
  }: { variables: Variable[]; takeLatestIfList?: boolean }
): VariableToParseInformation[] => {
  const variablesToParseInfo: VariableToParseInformation[] = []
  const inlineCodeMatches = [...text.matchAll(inlineCodeRegex)]
  inlineCodeMatches.forEach((match) => {
    if (isNotDefined(match.index) || !match[0].length) return
    const inlineCodeToEvaluate = match[1]
    const evaluatedValue = evaluateInlineCode(inlineCodeToEvaluate, {
      variables,
    })
    variablesToParseInfo.push({
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      textToReplace: match[0],
      value:
        safeStringify(
          takeLatestIfList && Array.isArray(evaluatedValue)
            ? evaluatedValue[evaluatedValue.length - 1]
            : evaluatedValue
        ) ?? '',
    })
  })
  const textWithInlineCodeParsed = text.replace(
    inlineCodeRegex,
    (_full, inlineCodeToEvaluate) =>
      evaluateInlineCode(inlineCodeToEvaluate, { variables })
  )
  const variableMatches = [...textWithInlineCodeParsed.matchAll(variableRegex)]
  variableMatches.forEach((match) => {
    if (isNotDefined(match.index) || !match[0].length) return
    const matchedVarName = match[1] ?? match[3]
    const variable = variables.find((variable) => {
      return matchedVarName === variable.name && isDefined(variable.value)
    }) as VariableWithValue | undefined
    variablesToParseInfo.push({
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      textToReplace: match[0],
      value:
        safeStringify(
          takeLatestIfList && Array.isArray(variable?.value)
            ? variable?.value[variable?.value.length - 1]
            : variable?.value
        ) ?? '',
    })
  })
  return variablesToParseInfo.sort((a, b) => a.startIndex - b.startIndex)
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
