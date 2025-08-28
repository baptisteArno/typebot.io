import type { Variable, VariableWithUnknowValue } from "./schemas";

export const transformPrefilledVariablesToVariables = (
  prefilledVariables: Record<string, unknown>,
  { existingVariables }: { existingVariables: Variable[] },
): VariableWithUnknowValue[] => {
  const newVariables: VariableWithUnknowValue[] = [];
  Object.entries(prefilledVariables).forEach(([name, value]) => {
    const existingVariable = existingVariables.find(
      (variable) => variable.name === name,
    );
    if (existingVariable)
      newVariables.push({ ...existingVariable, value: value ?? null });
  });
  return newVariables;
};
