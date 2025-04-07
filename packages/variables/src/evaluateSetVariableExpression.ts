import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { executeFunction } from "./executeFunction";
import { parseVariables } from "./parseVariables";
import type { Variable, VariableWithValue } from "./schemas";
export const evaluateSetVariableExpression = async (
  expression:
    | {
        type: "code";
        code: string;
      }
    | { type: "value"; value: VariableWithValue["value"] },
  {
    variables,
    sessionStore,
  }: {
    variables: Variable[];
    sessionStore: SessionStore;
  },
): Promise<{
  value: unknown;
  error?: { description: string; details?: string; context?: string };
}> => {
  if (expression.type === "value") return { value: expression.value };
  const isSingleVariable =
    expression.code.startsWith("{{") &&
    expression.code.endsWith("}}") &&
    expression.code.split("{{").length === 2;
  if (isSingleVariable)
    return {
      value: parseVariables(expression.code, { variables, sessionStore }),
    };
  // To avoid octal number evaluation
  if (
    !isNaN(expression.code as unknown as number) &&
    /0[^.].+/.test(expression.code)
  )
    return { value: expression.code };
  const { output, error } = await executeFunction({
    body: injectReturnKeywordIfNeeded(expression.code),
    variables,
    sessionStore,
  });
  if (error) {
    return {
      value: parseVariables(expression.code, { variables, sessionStore }),
      error: await parseUnknownError({
        err: error,
        context: "While evaluating set variable expression",
      }),
    };
  }
  return { value: output };
};

const injectReturnKeywordIfNeeded = (code: string) =>
  code.includes("return ") ? code : `return ${code}`;
