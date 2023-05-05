import { Variable } from '@typebot.io/schemas'
import {
  defaultParseVariablesOptions,
  parseVariables,
  ParseVariablesOptions,
} from './parseVariables'
import { parseGuessedValueType } from './parseGuessedValueType'

export const deepParseVariables =
  (
    variables: Variable[],
    options: ParseVariablesOptions & {
      guessCorrectType?: boolean
    } = defaultParseVariablesOptions
  ) =>
  <T extends Record<string, unknown>>(object: T): T =>
    Object.keys(object).reduce<T>((newObj, key) => {
      const currentValue = object[key]

      if (typeof currentValue === 'string') {
        const parsedVariable = parseVariables(variables, options)(currentValue)
        return {
          ...newObj,
          [key]: options.guessCorrectType
            ? parseGuessedValueType(parsedVariable)
            : parsedVariable,
        }
      }

      if (currentValue instanceof Object && currentValue.constructor === Object)
        return {
          ...newObj,
          [key]: deepParseVariables(
            variables,
            options
          )(currentValue as Record<string, unknown>),
        }

      if (currentValue instanceof Array)
        return {
          ...newObj,
          [key]: currentValue.map(deepParseVariables(variables, options)),
        }

      return { ...newObj, [key]: currentValue }
    }, {} as T)
