import { createAuth, option } from "@typebot.io/forge";

export const auth = createAuth({
  type: "encryptedCredentials",
  name: "Gandr account",
  schema: option.object({
    apiKey: option.string.meta({
      layout: {
        label: "API key",
        isRequired: true,
        inputType: "password",
        helperText:
          "You can create an API key at https://gandr.ai. Keys start with gnd_.",
        isDebounceDisabled: true,
        withVariableButton: false,
      },
    }),
  }),
});
