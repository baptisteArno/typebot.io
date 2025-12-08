import { createAnthropic } from "@ai-sdk/anthropic";
import { runGenerateVariables } from "@typebot.io/ai/runGenerateVariables";
import { createActionHandler } from "@typebot.io/forge";
import { generateVariables } from "../actions/generateVariables";

export const generateVariablesHandler = createActionHandler(generateVariables, {
  server: ({ credentials, options, variables, logs }) => {
    if (credentials?.apiKey === undefined)
      return logs.add("No API key provided");

    if (options.model === undefined) return logs.add("No model provided");

    return runGenerateVariables({
      model: createAnthropic({
        apiKey: credentials.apiKey,
      })(options.model),
      prompt: options.prompt,
      variablesToExtract: options.variablesToExtract,
      variables,
      logs,
    });
  },
});
