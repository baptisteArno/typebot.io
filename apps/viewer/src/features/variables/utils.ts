import prisma from '@/lib/prisma'
import {
  Result,
  SessionState,
  StartParams,
  Typebot,
  Variable,
  VariableWithUnknowValue,
  VariableWithValue,
} from '@typebot.io/schemas'
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
        return jsonParse(
          typeof value !== 'string' ? JSON.stringify(value) : value
        )
      const parsedValue = safeStringify(value)
      if (!parsedValue) return ''
      return parsedValue
    })
  }

export const extractVariablesFromText =
  (variables: Variable[]) =>
  (text: string): Variable[] => {
    const matches = [...text.matchAll(/\{\{(.*?)\}\}/g)]
    return matches.reduce<Variable[]>((acc, match) => {
      const variableName = match[1]
      const variable = variables.find(
        (variable) => variable.name === variableName
      )
      if (!variable) return acc
      return [...acc, variable]
    }, [])
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
): string | string[] | boolean | number | null | undefined => {
  if (value === null) return null
  if (value === undefined) return undefined
  if (typeof value !== 'string') return value
  const isNumberStartingWithZero =
    value.startsWith('0') && !value.startsWith('0.') && value.length > 1
  if (typeof value === 'string' && isNumberStartingWithZero) return value
  if (typeof value === 'number') return value
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === 'null') return null
  if (value === 'undefined') return undefined
  // isNaN works with strings
  if (isNaN(value as unknown as number)) return value
  return Number(value)
}

const jsonParse = (str: string) =>
  str
    .replace(/\n/g, `\\n`)
    .replace(/"/g, `\\"`)
    .replace(/\\[^n"]/g, `\\\\ `)

export const deepParseVariable =
  (variables: Variable[]) =>
  <T extends Record<string, unknown>>(object: T): T =>
    Object.keys(object).reduce<T>((newObj, key) => {
      const currentValue = object[key]

      if (typeof currentValue === 'string')
        return { ...newObj, [key]: parseVariables(variables)(currentValue) }

      if (currentValue instanceof Object && currentValue.constructor === Object)
        return {
          ...newObj,
          [key]: deepParseVariable(variables)(
            currentValue as Record<string, unknown>
          ),
        }

      if (currentValue instanceof Array)
        return {
          ...newObj,
          [key]: currentValue.map(deepParseVariable(variables)),
        }

      return { ...newObj, [key]: currentValue }
    }, {} as T)

export const prefillVariables = (
  variables: Typebot['variables'],
  prefilledVariables: NonNullable<StartParams['prefilledVariables']>
): Variable[] =>
  variables.map((variable) => {
    const prefilledVariable = prefilledVariables[variable.name]
    if (!prefilledVariable) return variable
    return {
      ...variable,
      value: safeStringify(prefilledVariable),
    }
  })

export const injectVariablesFromExistingResult = (
  variables: Typebot['variables'],
  resultVariables: Result['variables']
): Variable[] =>
  variables.map((variable) => {
    const resultVariable = resultVariables.find(
      (resultVariable) =>
        resultVariable.name === variable.name && !variable.value
    )
    if (!resultVariable) return variable
    return {
      ...variable,
      value: resultVariable.value,
    }
  })

export const updateVariables =
  (state: SessionState) =>
  async (newVariables: VariableWithUnknowValue[]): Promise<SessionState> => ({
    ...state,
    typebot: {
      ...state.typebot,
      variables: updateTypebotVariables(state)(newVariables),
    },
    result: {
      ...state.result,
      variables: await updateResultVariables(state)(newVariables),
    },
  })

const updateResultVariables =
  ({ result }: Pick<SessionState, 'result' | 'typebot'>) =>
  async (
    newVariables: VariableWithUnknowValue[]
  ): Promise<VariableWithValue[]> => {
    const serializedNewVariables = newVariables.map((variable) => ({
      ...variable,
      value: Array.isArray(variable.value)
        ? variable.value.map(safeStringify).filter(isDefined)
        : safeStringify(variable.value),
    }))

    const updatedVariables = [
      ...result.variables.filter((existingVariable) =>
        serializedNewVariables.every(
          (newVariable) => existingVariable.id !== newVariable.id
        )
      ),
      ...serializedNewVariables,
    ].filter((variable) => isDefined(variable.value)) as VariableWithValue[]

    if (result.id)
      await prisma.result.update({
        where: {
          id: result.id,
        },
        data: {
          variables: updatedVariables,
        },
      })

    return updatedVariables
  }

const updateTypebotVariables =
  ({ typebot }: Pick<SessionState, 'result' | 'typebot'>) =>
  (newVariables: VariableWithUnknowValue[]): Variable[] => {
    const serializedNewVariables = newVariables.map((variable) => ({
      ...variable,
      value: Array.isArray(variable.value)
        ? variable.value.map(safeStringify).filter(isDefined)
        : safeStringify(variable.value),
    }))

    return [
      ...typebot.variables.filter((existingVariable) =>
        serializedNewVariables.every(
          (newVariable) => existingVariable.id !== newVariable.id
        )
      ),
      ...serializedNewVariables,
    ]
  }

export const findUniqueVariableValue =
  (variables: Variable[]) =>
  (value: string | undefined): string | string[] | null => {
    if (!value || !value.startsWith('{{') || !value.endsWith('}}')) return null
    const variableName = value.slice(2, -2)
    const variable = variables.find(
      (variable) => variable.name === variableName
    )
    return variable?.value ?? null
  }
