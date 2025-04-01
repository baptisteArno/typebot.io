import { option } from "@typebot.io/forge";
import type { AuthDefinition } from "@typebot.io/forge/types";

export const auth = {
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
} satisfies AuthDefinition;
