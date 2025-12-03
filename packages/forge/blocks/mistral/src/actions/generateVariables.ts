import { createMistral } from "@ai-sdk/mistral";
import { parseGenerateVariablesOptions } from "@typebot.io/ai/parseGenerateVariablesOptions";
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
    models: {
      type: "static",
      items: models,
    },
    getModel: ({ credentials, model }) =>
      createMistral({
        apiKey: credentials.apiKey,
      })(model),
  },
  getSetVariableIds: (options) =>
    options.variablesToExtract?.map((v) => v.variableId).filter(isDefined) ??
    [],
});
