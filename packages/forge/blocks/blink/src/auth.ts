import { createAuth, option } from "@typebot.io/forge";

export const auth = createAuth({
  type: "encryptedCredentials",
  name: "Blink app",
  schema: option.object({
    apiKey: option.string.layout({
      label: "App token",
      isRequired: true,
      inputType: "password",
      helperText:
        "You can generate an app token by following [the official Blink instructions](https://developer.joinblink.com/docs/creating-an-integration).",
      withVariableButton: false,
      isDebounceDisabled: true,
    }),
  }),
});
