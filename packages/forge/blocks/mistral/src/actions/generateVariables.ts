import { createMistral } from "@ai-sdk/mistral";
import { parseGenerateVariablesOptions } from "@typebot.io/ai/parseGenerateVariablesOptions";
import { runGenerateVariables } from "@typebot.io/ai/runGenerateVariables";
import { createAction } from "@typebot.io/forge";
import { isDefined } from "@typebot.io/lib/utils";
import { auth } from "../auth";
import { models } from "../constants";

export const generateVariables = createAction({
  name: "Generate variables",
  auth,
  options: parseGenerateVariablesOptions({
    models: { type: "static", models },
  }),
  turnableInto: [
    {
      blockId: "openai",
    },
    {
      blockId: "anthropic",
      transform: (options) => ({
        ...options,
        model: undefined,
      }),
    },
  ],
  aiGenerate: {
    fetcherId: "fetchModels",
    getModel: ({ credentials, model }) =>
      createMistral({
        apiKey: credentials.apiKey,
      })(model),
  },
  getSetVariableIds: (options) =>
    options.variablesToExtract?.map((v) => v.variableId).filter(isDefined) ??
    [],
  run: {
    server: ({ credentials, options, variables, logs }) => {
      if (credentials?.apiKey === undefined)
        return logs.add("No API key provided");

      if (options.model === undefined) return logs.add("No model provided");

      return runGenerateVariables({
        model: createMistral({
          apiKey: credentials.apiKey,
        })(options.model),
        variablesToExtract: options.variablesToExtract,
        prompt: options.prompt,
        variables,
        logs,
      });
    },
  },
});
