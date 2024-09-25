import { createMistral } from "@ai-sdk/mistral";
import { createAction } from "@typebot.io/forge";
import { isDefined } from "@typebot.io/lib/utils";
import { parseGenerateVariablesOptions } from "@typebot.io/openai-block/shared/parseGenerateVariablesOptions";
import { runGenerateVariables } from "@typebot.io/openai-block/shared/runGenerateVariables";
import { auth } from "../auth";
import { fetchModels } from "../helpers/fetchModels";

export const generateVariables = createAction({
  name: "Generate variables",
  auth,
  options: parseGenerateVariablesOptions({ modelFetch: "fetchModels" }),
  fetchers: [
    {
      id: "fetchModels",
      dependencies: [],
      fetch: fetchModels,
    },
  ],
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
