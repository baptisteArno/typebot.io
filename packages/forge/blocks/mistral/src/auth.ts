import { createAuth, option } from "@typebot.io/forge";

export const auth = createAuth({
  type: "encryptedCredentials",
  name: "Mistral account",
  schema: option.object({
    apiKey: option.string.layout({
      label: "API key",
      isRequired: true,
      inputType: "password",
      withVariableButton: false,
      helperText:
        "You can generate an API key [here](https://console.mistral.ai/api-keys).",
      isDebounceDisabled: true,
    }),
  }),
});
