import { Variable, VariableForTest } from 'models'

export const convertVariablesForTestToVariables = (
  variablesForTest: VariableForTest[],
  variables: Variable[]
): Variable[] => {
  if (!variablesForTest) return []
  return [
    ...variables,
    ...variablesForTest
      .filter((v) => v.variableId)
      .map((variableForTest) => {
        const variable = variables.find(
          (v) => v.id === variableForTest.variableId
        ) as Variable
        return { ...variable, value: variableForTest.value }
      }, {}),
  ]
}
