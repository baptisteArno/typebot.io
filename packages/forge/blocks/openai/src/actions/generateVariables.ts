import { createOpenAI } from "@ai-sdk/openai";
import { parseGenerateVariablesOptions } from "@typebot.io/ai/parseGenerateVariablesOptions";
import { runGenerateVariables } from "@typebot.io/ai/runGenerateVariables";
import { createAction } from "@typebot.io/forge";
import { isDefined } from "@typebot.io/lib/utils";
import { auth } from "../auth";
import { baseOptions } from "../baseOptions";
import { chatModels, reasoningModels } from "../constants";

export const generateVariables = createAction({
  name: "Generate variables",
  auth,
  baseOptions,
  options: parseGenerateVariablesOptions({
    models: { type: "static", models: chatModels.concat(reasoningModels) },
  }),
  aiGenerate: {
    models: { type: "static", items: chatModels.concat(reasoningModels) },
    getModel: ({ credentials, model }) =>
      createOpenAI({
        apiKey: credentials.apiKey,
        compatibility: "strict",
      })(model),
  },
  turnableInto: [
    {
      blockId: "mistral",
    },
    {
      blockId: "anthropic",
      transform: (options) => ({
        ...options,
        model: undefined,
      }),
    },
  ],
  getSetVariableIds: (options) =>
    options.variablesToExtract?.map((v) => v.variableId).filter(isDefined) ??
    [],
  run: {
    server: ({ credentials, options, variables, logs }) => {
      if (credentials?.apiKey === undefined)
        return logs.add("No API key provided");

      if (options.model === undefined) return logs.add("No model provided");

      return runGenerateVariables({
        model: createOpenAI({
          apiKey: credentials.apiKey,
          compatibility: "strict",
        })(options.model),
        prompt: options.prompt,
        variablesToExtract: options.variablesToExtract,
        variables,
        logs,
      });
    },
  },
});
