import { createAnthropic } from "@ai-sdk/anthropic";
import { parseGenerateVariablesOptions } from "@typebot.io/ai/parseGenerateVariablesOptions";
import { createAction } from "@typebot.io/forge";
import { isDefined } from "@typebot.io/lib/utils";
import { auth } from "../auth";
import { anthropicModels } from "../constants";

export const generateVariables = createAction({
  name: "Generate variables",
  auth,
  options: parseGenerateVariablesOptions({
    models: {
      type: "static",
      models: anthropicModels,
    },
  }),
  turnableInto: [
    {
      blockId: "openai",
    },
    {
      blockId: "mistral",
    },
  ],
  aiGenerate: {
    models: {
      type: "static",
      items: anthropicModels,
    },
    getModel: ({ credentials, model }) =>
      createAnthropic({
        apiKey: credentials.apiKey,
      })(model),
  },
  getSetVariableIds: (options) =>
    options.variablesToExtract?.map((v) => v.variableId).filter(isDefined) ??
    [],
});
