import { type AuthDefinition, option } from "@typebot.io/forge";

export const auth = {
  type: "encryptedCredentials",
  name: "Hackernews account",
  schema: option.object({
    apiKey: option.string.layout({
      label: "API key",
      isRequired: true,
      inputType: "password",
      helperText: "You can generate an API key [here](<INSERT_URL>).",
      withVariableButton: false,
      isDebounceDisabled: true,
    }),
  }),
} satisfies AuthDefinition;
