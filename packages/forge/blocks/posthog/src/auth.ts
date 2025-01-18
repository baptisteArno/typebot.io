import { option } from "@typebot.io/forge";
import type { AuthDefinition } from "@typebot.io/forge/types";

export const auth = {
  type: "encryptedCredentials",
  name: "Posthog account",
  schema: option.object({
    apiKey: option.string.layout({
      label: "API key",
      isRequired: true,
      inputType: "password",
      helperText:
        "You can find your project API key [here](https://us.posthog.com/project/YOUR_PROJECT_ID/settings/project-details).",
      withVariableButton: false,
      isDebounceDisabled: true,
    }),
    host: option.string.layout({
      label: "Host",
      isRequired: true,
      helperText:
        "You can find your api host value [here](https://us.posthog.com/project/YOUR_PROJECT_ID/settings/project-details).",
      withVariableButton: false,
      isDebounceDisabled: true,
    }),
  }),
} satisfies AuthDefinition;
