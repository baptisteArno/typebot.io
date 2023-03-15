import { Variable } from '@typebot.io/schemas'
import {
  defaultParseVariablesOptions,
  parseVariables,
  ParseVariablesOptions,
} from './parseVariables'

export const deepParseVariables =
  (
    variables: Variable[],
    options: ParseVariablesOptions = defaultParseVariablesOptions
  ) =>
  <T extends Record<string, unknown>>(object: T): T =>
    Object.keys(object).reduce<T>((newObj, key) => {
      const currentValue = object[key]

      if (typeof currentValue === 'string')
        return {
          ...newObj,
          [key]: parseVariables(variables, options)(currentValue),
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
