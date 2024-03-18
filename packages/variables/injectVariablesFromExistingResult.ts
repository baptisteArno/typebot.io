import { Variable } from './types'

export const injectVariablesFromExistingResult = (
  variables: Variable[],
  resultVariables: any[]
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
