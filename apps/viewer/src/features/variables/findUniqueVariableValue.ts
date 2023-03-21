import { Variable } from '@typebot.io/schemas'

export const findUniqueVariableValue =
  (variables: Variable[]) =>
  (value: string | undefined): Variable['value'] => {
    if (!value || !value.startsWith('{{') || !value.endsWith('}}')) return null
    const variableName = value.slice(2, -2)
    const variable = variables.find(
      (variable) => variable.name === variableName
    )
    return variable?.value ?? null
  }
