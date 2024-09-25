import type { Variable } from "./schemas";

export const extractVariablesFromText =
  (variables: Variable[]) =>
  (text: string): Variable[] => {
    const matches = [...text.matchAll(/\{\{(.*?)\}\}/g)];
    return matches.reduce<Variable[]>((acc, match) => {
      const variableName = match[1];
      const variable = variables.find(
        (variable) => variable.name === variableName,
      );
      if (
        !variable ||
        acc.find((accVariable) => accVariable.id === variable.id)
      )
        return acc;
      return [...acc, variable];
    }, []);
  };
