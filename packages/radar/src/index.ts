import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import { env } from "@typebot.io/env";
import { safeStringify } from "@typebot.io/lib/safeStringify";
import type { TypebotV6 } from "@typebot.io/typebot/schemas/typebot";
import { evaluateSetVariableExpression } from "@typebot.io/variables/evaluateSetVariableExpression";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import type { Variable } from "@typebot.io/variables/schemas";

type Params = {
  debug: boolean;
};

const fillVariableValues = async (typebot: TypebotV6): Promise<Variable[]> => {
  const variables: Variable[] = [];
  for (const group of typebot.groups) {
    for (const block of group.blocks) {
      if (block.type === LogicBlockType.SET_VARIABLE) {
        const existingVariable = variables.find(
          (variable) => variable.id === block.options?.variableId,
        );
        if (
          existingVariable ||
          !block.options?.variableId ||
          (block.options.type && block.options.type !== "Custom")
        )
          continue;
        const variableName = typebot.variables.find(
          (variable) => variable.id === block.options!.variableId,
        )?.name;
        if (!variableName) continue;

        const { value } =
          block.options.isCode && block.options.expressionToEvaluate
            ? await evaluateSetVariableExpression(typebot.variables)({
                type: "code",
                code: block.options.expressionToEvaluate,
              })
            : { value: block.options.expressionToEvaluate };

        variables.push({
          id: block.options.variableId,
          name: variableName,
          value: Array.isArray(value)
            ? value.map(safeStringify)
            : safeStringify(value),
        });
      }
    }
  }
  return variables;
};

export const computeRiskLevel = async (typebot: TypebotV6, params?: Params) => {
  const variables = await fillVariableValues(typebot);
  const stringifiedTypebot = parseVariables(variables)(JSON.stringify(typebot));
  if (
    env.RADAR_HIGH_RISK_KEYWORDS?.some((keyword) =>
      new RegExp(
        `(?<!(https?://|@)[^\\s"]*)\\b${keyword}${
          keyword.includes("$") ? "" : "\\b"
        }`,
        "gi",
      ).test(stringifiedTypebot),
    )
  ) {
    if (params?.debug) {
      console.log(
        "High risk keywords detected:",
        env.RADAR_HIGH_RISK_KEYWORDS?.find((keyword) =>
          new RegExp(
            `(?<!(https?://|@)[^\\s"]*)\\b${keyword}${
              keyword.includes("$") ? "" : "\\b"
            }`,
            "gi",
          ).test(stringifiedTypebot),
        ),
      );
    }
    return 100;
  }

  if (
    env.RADAR_CUMULATIVE_KEYWORDS?.some((set) =>
      set.every((keyword) =>
        keyword.some((k) =>
          new RegExp(
            `(?<!(https?://|@)[^\\s"]*)\\b${k}${k.includes("$") ? "" : "\\b"}`,
            "gi",
          ).test(stringifiedTypebot),
        ),
      ),
    )
  ) {
    if (params?.debug) {
      console.log(
        "Cumulative keywords detected:",
        env.RADAR_CUMULATIVE_KEYWORDS?.find((set) =>
          set.every((keyword) =>
            keyword.some((k) =>
              new RegExp(
                `(?<!(https?://|@)[^\\s"]*)\\b${k}${
                  k.includes("$") ? "" : "\\b"
                }`,
                "gi",
              ).test(stringifiedTypebot),
            ),
          ),
        ),
      );
    }
    return 100;
  }
  if (
    env.RADAR_INTERMEDIATE_RISK_KEYWORDS?.some((keyword) =>
      stringifiedTypebot.toLowerCase().includes(keyword),
    )
  )
    return 50;
  return 0;
};
