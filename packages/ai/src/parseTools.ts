import type { VariableStore } from "@typebot.io/forge/types";
import { safeStringify } from "@typebot.io/lib/safeStringify";
import { isNotEmpty } from "@typebot.io/lib/utils";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { executeFunction } from "@typebot.io/variables/executeFunction";
import type { Variable } from "@typebot.io/variables/schemas";
import type { Tool } from "ai";
import { z } from "zod";
import type { Tools } from "./schemas";
import { zodToSchema } from "./zodToSchema";

export const parseTools = ({
  tools,
  variables,
  sessionStore,
}: {
  tools: Tools;
  variables: VariableStore;
  sessionStore: SessionStore;
  onNewVariabes?: (newVariables: Variable[]) => void;
}): Record<string, Tool> => {
  if (!tools?.length) return {};
  return tools.reduce<Record<string, Tool>>((acc, tool) => {
    if (!tool.code || !tool.name) return acc;
    acc[tool.name] = {
      description: tool.description,
      parameters: parseParameters(tool.parameters),
      execute: async (args) => {
        const { output, newVariables } = await executeFunction({
          sessionStore,
          variables: variables.list(),
          args,
          body: tool.code!,
        });
        if (newVariables && newVariables.length > 0)
          variables.set(newVariables);
        return safeStringify(output) ?? "";
      },
    } satisfies Tool;
    return acc;
  }, {});
};

const parseParameters = (
  parameters: NonNullable<Tools>[number]["parameters"],
) => {
  if (!parameters || parameters?.length === 0) return zodToSchema(z.object({}));

  const shape: Record<string, z.ZodTypeAny> = {};
  parameters.forEach((param) => {
    if (!param.name) return;
    switch (param.type) {
      case "string":
        shape[param.name] = z.string();
        break;
      case "number":
        shape[param.name] = z.number();
        break;
      case "boolean":
        shape[param.name] = z.boolean();
        break;
      case "enum": {
        if (!param.values) return;
        const values = param.values.filter(isDefined);
        if (!isNonEmptyArray(values)) return;
        shape[param.name] = z.enum(values);
        break;
      }
    }
    if (isNotEmpty(param.description))
      shape[param.name] = shape[param.name]!.describe(param.description);
    if (param.required === false)
      shape[param.name] = shape[param.name]!.optional();
  });

  return zodToSchema(z.object(shape));
};

const isNonEmptyArray = <T>(items: T[]): items is [T, ...T[]] =>
  items.length > 0;

const isDefined = <T>(value: T | undefined): value is T => value !== undefined;
