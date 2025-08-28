import type { Variable, VariableWithValue } from "./schemas";

export const injectVariableValues = ({
  variablesWithValue,
  variables,
}: {
  variablesWithValue?: VariableWithValue[];
  variables: Variable[];
}): Variable[] =>
  variablesWithValue
    ? variables.map((existingVariable) => {
        if (existingVariable.value) return existingVariable;
        const variableWithUnknownValue = variablesWithValue.find(
          (variableWithValue) =>
            variableWithValue.name === existingVariable.name &&
            !existingVariable.value,
        );
        if (!variableWithUnknownValue) return existingVariable;
        return {
          ...existingVariable,
          value: variableWithUnknownValue.value,
        };
      })
    : variables;
