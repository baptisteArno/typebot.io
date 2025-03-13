import type { VariableStore } from "@typebot.io/forge/types";
import { safeStringify } from "@typebot.io/lib/safeStringify";
import { isNotEmpty } from "@typebot.io/lib/utils";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { executeFunction } from "@typebot.io/variables/executeFunction";
import type { Variable } from "@typebot.io/variables/schemas";
import { z } from "@typebot.io/zod";
import type { Tool } from "ai";
import type { Tools } from "./schemas";

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
): z.ZodTypeAny => {
  if (!parameters || parameters?.length === 0) return z.object({});

  const shape: z.ZodRawShape = {};
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
        if (!param.values || param.values.length === 0) return;
        shape[param.name] = z.enum(param.values as any);
        break;
      }
    }
    if (isNotEmpty(param.description))
      shape[param.name] = shape[param.name]!.describe(param.description);
    if (param.required === false)
      shape[param.name] = shape[param.name]!.optional();
  });

  return z.object(shape);
};
