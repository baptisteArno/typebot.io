import { Variable } from './types'

export const findUniqueVariable =
  (variables: Variable[]) =>
  (value: string | undefined): Variable | null => {
    if (!value || !value.startsWith('{{') || !value.endsWith('}}')) return null
    const variableName = value.slice(2, -2)
    const variable = variables.find(
      (variable) => variable.name === variableName
    )
    return variable ?? null
  }
