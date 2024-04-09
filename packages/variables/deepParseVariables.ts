import {
  defaultParseVariablesOptions,
  parseVariables,
  ParseVariablesOptions,
} from './parseVariables'
import { parseGuessedTypeFromString } from './parseGuessedTypeFromString'
import { Variable } from './types'

type DeepParseOptions = {
  guessCorrectTypes?: boolean
  removeEmptyStrings?: boolean
}

export const deepParseVariables =
  (
    variables: Variable[],
    deepParseOptions: DeepParseOptions = {
      guessCorrectTypes: false,
      removeEmptyStrings: false,
    },
    parseVariablesOptions: ParseVariablesOptions = defaultParseVariablesOptions
  ) =>
  <T>(object: T): T => {
    if (!object) return object as T
    if (typeof object !== 'object') return object as T
    return Object.keys(object).reduce<T>((newObj, key) => {
      const currentValue = (object as Record<string, unknown>)[key]

      if (typeof currentValue === 'string') {
        const parsedVariable = parseVariables(
          variables,
          parseVariablesOptions
        )(currentValue)
        if (deepParseOptions.removeEmptyStrings && parsedVariable === '')
          return newObj
        return {
          ...newObj,
          [key]: deepParseOptions.guessCorrectTypes
            ? parseGuessedTypeFromString(parsedVariable)
            : parsedVariable,
        }
      }

      if (currentValue instanceof Object && currentValue.constructor === Object)
        return {
          ...newObj,
          [key]: deepParseVariables(
            variables,
            deepParseOptions,
            parseVariablesOptions
          )(currentValue as Record<string, unknown>),
        }

      if (currentValue instanceof Array)
        return {
          ...newObj,
          [key]: currentValue.map(
            deepParseVariables(
              variables,
              deepParseOptions,
              parseVariablesOptions
            )
          ),
        }

      return { ...newObj, [key]: currentValue }
    }, {} as T)
  }
