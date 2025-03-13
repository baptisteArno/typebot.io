import type { SessionStore } from "@typebot.io/runtime-session-store";
import { parseGuessedTypeFromString } from "./parseGuessedTypeFromString";
import { type ParseVariablesOptions, parseVariables } from "./parseVariables";
import type { Variable } from "./schemas";
import type { WithoutVariables } from "./types";

export const deepParseVariables = <T>(
  object: T,
  {
    variables,
    guessCorrectTypes = false,
    removeEmptyStrings = false,
    sessionStore,
    ...parseVariablesOptions
  }: {
    variables: Variable[];
    guessCorrectTypes?: boolean;
    removeEmptyStrings?: boolean;
    sessionStore: SessionStore;
  } & ParseVariablesOptions,
): WithoutVariables<T> => {
  if (!object) return object as WithoutVariables<T>;
  if (typeof object !== "object") return object as WithoutVariables<T>;
  return Object.keys(object).reduce<WithoutVariables<T>>(
    (newObj, key) => {
      const currentValue = (object as Record<string, unknown>)[key];

      if (typeof currentValue === "string") {
        const parsedVariable = parseVariables(currentValue, {
          variables,
          sessionStore,
          ...parseVariablesOptions,
        });
        if (removeEmptyStrings && parsedVariable === "") return newObj;
        return {
          ...newObj,
          [key]: guessCorrectTypes
            ? parseGuessedTypeFromString(parsedVariable)
            : parsedVariable,
        };
      }

      if (currentValue instanceof Object && currentValue.constructor === Object)
        return {
          ...newObj,
          [key]: deepParseVariables(currentValue as Record<string, unknown>, {
            variables,
            guessCorrectTypes,
            removeEmptyStrings,
            sessionStore,
            ...parseVariablesOptions,
          }),
        };

      if (currentValue instanceof Array)
        return {
          ...newObj,
          [key]: currentValue.map((value) =>
            deepParseVariables(value, {
              variables,
              guessCorrectTypes,
              removeEmptyStrings,
              sessionStore,
              ...parseVariablesOptions,
            }),
          ),
        };

      return { ...newObj, [key]: currentValue };
    },
    {} as WithoutVariables<T>,
  );
};
