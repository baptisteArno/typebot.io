import { option } from "@typebot.io/forge";
import type { AuthDefinition } from "@typebot.io/forge/types";

export const auth = {
  type: "encryptedCredentials",
  name: "Together account",
  schema: option.object({
    apiKey: option.string.layout({
      label: "API key",
      isRequired: true,
      inputType: "password",
      helperText:
        "You can get your API key [here](https://api.together.xyz/settings/api-keys).",
      isDebounceDisabled: true,
    }),
  }),
} satisfies AuthDefinition;
