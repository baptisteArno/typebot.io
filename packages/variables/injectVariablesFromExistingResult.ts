import { Result, Variable } from '@typebot.io/schemas'

export const injectVariablesFromExistingResult = (
  variables: Variable[],
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
