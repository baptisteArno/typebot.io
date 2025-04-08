import type { SessionStore } from "@typebot.io/runtime-session-store";
import { parseGuessedValueType } from "./parseGuessedValueType";
import { parseVariables } from "./parseVariables";
import type { Variable } from "./schemas";

export const parseVariableNumber = (
  input: number | `{{${string}}}` | undefined,
  {
    sessionStore,
    variables,
  }: { sessionStore: SessionStore; variables: Variable[] },
): number | undefined => {
  if (typeof input === "number" || input === undefined) return input;
  const parsedInput = parseGuessedValueType(
    parseVariables(input, { variables, sessionStore }),
  );
  if (typeof parsedInput !== "number") return undefined;
  return parsedInput;
};
