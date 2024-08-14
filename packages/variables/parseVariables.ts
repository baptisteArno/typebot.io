import { safeStringify } from '@typebot.io/lib/safeStringify'
import { isDefined, isNotDefined } from '@typebot.io/lib/utils'
import { Variable, VariableWithValue } from './types'
import { createCodeRunner } from './codeRunners'

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
  try {
    const body = parseVariables(variables, { fieldToParse: 'id' })(code)
    return createCodeRunner({ variables })(
      body.includes('return ') ? body : `return ${body}`
    )
  } catch (err) {
    return parseVariables(variables)(code)
  }
}

type VariableToParseInformation = {
  startIndex: number
  endIndex: number
  textToReplace: string
  value: string
  variableId?: string
}

export const getVariablesToParseInfoInText = (
  text: string,
  {
    variables,
    takeLatestIfList,
  }: { variables: Variable[]; takeLatestIfList?: boolean }
): VariableToParseInformation[] => {
  const inlineVarsParseInfo: VariableToParseInformation[] = []
  const inlineCodeMatches = [...text.matchAll(inlineCodeRegex)]
  inlineCodeMatches.forEach((match) => {
    if (isNotDefined(match.index) || !match[0].length) return
    const inlineCodeToEvaluate = match[1]
    const evaluatedValue = evaluateInlineCode(inlineCodeToEvaluate, {
      variables,
    })
    inlineVarsParseInfo.push({
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
  const variablesParseInfo: VariableToParseInformation[] = []
  const variableMatches = [...text.matchAll(variableRegex)]
  variableMatches.forEach((match) => {
    if (isNotDefined(match.index) || !match[0].length) return
    const isPartOfInlineCode = inlineVarsParseInfo.some(
      (inVar) =>
        match.index >= inVar.startIndex && match.index <= inVar.endIndex
    )
    if (isPartOfInlineCode) return
    const matchedVarName = match[1] ?? match[3]
    const variable = variables.find((variable) => {
      return matchedVarName === variable.name
    }) as VariableWithValue | undefined
    variablesParseInfo.push({
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      textToReplace: match[0],
      value:
        safeStringify(
          takeLatestIfList && Array.isArray(variable?.value)
            ? variable?.value[variable?.value.length - 1]
            : variable?.value
        ) ?? '',
      variableId: variable?.id,
    })
  })
  return inlineVarsParseInfo
    .concat(variablesParseInfo)
    .sort((a, b) => a.startIndex - b.startIndex)
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
