import { JSONParse } from "@typebot.io/lib/JSONParse";
import { isNotDefined } from "@typebot.io/lib/utils";
import type { Variable, VariableWithValue } from "./schemas";

export const transformVariablesToList =
  (variables: Variable[]) =>
  (variableIds: string[]): VariableWithValue[] => {
    const newVariables = variables.reduce<VariableWithValue[]>(
      (variables, variable) => {
        if (!variableIds.includes(variable.id) || isNotDefined(variable.value))
          return variables;
        if (Array.isArray(variable.value)) {
          variables.push({
            ...variable,
            value: variable.value,
          });
          return variables;
        }
        try {
          const potentialArray = JSONParse(variable.value);
          if (Array.isArray(potentialArray)) {
            variables.push({
              ...variable,
              value: potentialArray,
            });
            return variables;
          }
        } catch (_error) {
          // Not an stringified array, skipping...
        }
        variables.push({
          ...variable,
          value: [variable.value],
        });
        return variables;
      },
      [],
    );
    return newVariables;
  };
