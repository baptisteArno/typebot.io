import prisma from '@/lib/prisma'
import {
  SessionState,
  StartParams,
  Typebot,
  Variable,
  VariableWithUnknowValue,
  VariableWithValue,
} from 'models'
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
      }) as VariableWithValue | undefined
      if (!variable || variable.value === null) return ''
      if (options.fieldToParse === 'id') return variable.id
      const { value } = variable
      if (options.escapeForJson) return jsonParse(value)
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
): string | boolean | number | null | undefined => {
  if (value === null) return null
  if (value === undefined) return undefined
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

export const parsePrefilledVariables = (
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

export const updateVariables =
  (state: SessionState) =>
  async (newVariables: VariableWithUnknowValue[]): Promise<SessionState> => ({
    ...state,
    typebot: {
      ...state.typebot,
      variables: updateTypebotVariables(state)(newVariables),
    },
    result: state.result
      ? {
          ...state.result,
          variables: await updateResultVariables(state)(newVariables),
        }
      : undefined,
  })

const updateResultVariables =
  ({ result }: Pick<SessionState, 'result' | 'typebot'>) =>
  async (
    newVariables: VariableWithUnknowValue[]
  ): Promise<VariableWithValue[]> => {
    if (!result) return []
    const serializedNewVariables = newVariables.map((variable) => ({
      ...variable,
      value: safeStringify(variable.value),
    }))

    const updatedVariables = [
      ...result.variables.filter((existingVariable) =>
        serializedNewVariables.every(
          (newVariable) => existingVariable.id !== newVariable.id
        )
      ),
      ...serializedNewVariables,
    ].filter((variable) => isDefined(variable.value)) as VariableWithValue[]

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
      value: safeStringify(variable.value),
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
