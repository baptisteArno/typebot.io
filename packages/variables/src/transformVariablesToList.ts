import { JSONParse } from "@typebot.io/lib/JSONParse";
import { isNotDefined } from "@typebot.io/lib/utils";
import type { Variable, VariableWithValue } from "./schemas";

export const transformVariablesToList =
  (variables: Variable[]) =>
  (variableIds: string[]): VariableWithValue[] => {
    const newVariables = variables.reduce<VariableWithValue[]>(
      (variables, variable) => {
        if (
          !variableIds.includes(variable.id) ||
          isNotDefined(variable.value) ||
          typeof variable.value !== "string"
        )
          return variables;
        try {
          const potentialArray = JSONParse(variable.value);
          console.log(potentialArray);
          if (Array.isArray(potentialArray))
            return [
              ...variables,
              {
                ...variable,
                value: potentialArray,
              },
            ];
          return variables;
        } catch (error) {
          // Not an stringified array, skipping...
        }
        return [
          ...variables,
          {
            ...variable,
            value: [variable.value],
          },
        ];
      },
      [],
    );
    return newVariables;
  };
