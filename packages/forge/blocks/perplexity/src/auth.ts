import { createAuth, option } from "@typebot.io/forge";

export const auth = createAuth({
  type: "encryptedCredentials",
  name: "Perplexity account",
  schema: option.object({
    apiKey: option.string.layout({
      label: "API key",
      isRequired: true,
      inputType: "password",
      helperText:
        "You can generate an API key [here](https://www.perplexity.ai/settings/api)",
      placeholder: "pplx-...",
      withVariableButton: false,
      isDebounceDisabled: true,
    }),
  }),
});
