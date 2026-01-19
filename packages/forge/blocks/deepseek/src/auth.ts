import { createAuth, option } from "@typebot.io/forge";
import { defaultBaseUrl } from "./constants";

export const auth = createAuth({
  type: "encryptedCredentials",
  name: "DeepSeek account",
  schema: option.object({
    apiKey: option.string.meta({
      layout: {
        label: "API key",
        isRequired: true,
        inputType: "password",
        helperText:
          "You can generate an API key [here](https://platform.deepseek.com/api_keys).",
        placeholder: "sk-...",
        withVariableButton: false,
        isDebounceDisabled: true,
      },
    }),
    baseUrl: option.string.meta({
      layout: {
        label: "Base URL",
        defaultValue: defaultBaseUrl,
        withVariableButton: false,
        isDebounceDisabled: true,
      },
    }),
  }),
});
