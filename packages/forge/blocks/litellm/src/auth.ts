import { createAuth, option } from "@typebot.io/forge";
import { defaultBaseUrl } from "./constants";

export const auth = createAuth({
  type: "encryptedCredentials",
  name: "LiteLLM account",
  schema: option.object({
    apiKey: option.string.meta({
      layout: {
        label: "API key",
        isRequired: true,
        inputType: "password",
        helperText:
          "The master or virtual key of your LiteLLM proxy. See the [LiteLLM docs](https://docs.litellm.ai/docs/proxy/virtual_keys).",
        withVariableButton: false,
        isDebounceDisabled: true,
      },
    }),
    baseUrl: option.string.meta({
      layout: {
        label: "Base URL",
        defaultValue: defaultBaseUrl,
        helperText:
          "The base URL of your LiteLLM proxy (OpenAI-compatible endpoint).",
        withVariableButton: false,
        isDebounceDisabled: true,
      },
    }),
  }),
});
