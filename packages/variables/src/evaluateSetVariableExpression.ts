import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import { executeFunction } from "./executeFunction";
import { parseVariables } from "./parseVariables";
import type { Variable, VariableWithValue } from "./schemas";

export const evaluateSetVariableExpression =
  (variables: Variable[]) =>
  async (
    expression:
      | {
          type: "code";
          code: string;
        }
      | { type: "value"; value: VariableWithValue["value"] },
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
      return { value: parseVariables(variables)(expression.code) };
    // To avoid octal number evaluation
    if (
      !isNaN(expression.code as unknown as number) &&
      /0[^.].+/.test(expression.code)
    )
      return { value: expression.code };
    const { output, error } = await executeFunction({
      body: injectReturnKeywordIfNeeded(expression.code),
      variables,
    });
    if (error) {
      return {
        value: parseVariables(variables)(expression.code),
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
