import { createMistral } from "@ai-sdk/mistral";
import { runGenerateVariables } from "@typebot.io/ai/runGenerateVariables";
import { createActionHandler } from "@typebot.io/forge";
import { generateVariables } from "../actions/generateVariables";

export const generateVariablesHandler = createActionHandler(generateVariables, {
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
});
