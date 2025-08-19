import type { Variable } from "./schemas";

export const injectVariablesFromExistingResult = (
  prefilledVariables: Variable[],
  resultVariables: any[],
): Variable[] =>
  prefilledVariables.map((prefilledVariable) => {
    if (prefilledVariable.value) return prefilledVariable;
    const resultVariable = resultVariables.find(
      (resultVariable) =>
        resultVariable.name === prefilledVariable.name &&
        !prefilledVariable.value,
    );
    if (!resultVariable) return prefilledVariable;
    return {
      ...prefilledVariable,
      value: resultVariable.value,
    };
  });
