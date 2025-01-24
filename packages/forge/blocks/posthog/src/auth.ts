import { option } from "@typebot.io/forge";
import type { AuthDefinition } from "@typebot.io/forge/types";

export const auth = {
  type: "encryptedCredentials",
  name: "Posthog account",
  schema: option.object({
    apiKey: option.string.layout({
      label: "Project API key",
      isRequired: true,
      inputType: "password",
      withVariableButton: false,
      isDebounceDisabled: true,
    }),
    host: option.string.layout({
      label: "Host",
      withVariableButton: false,
      isDebounceDisabled: true,
      defaultValue: "https://us.posthog.com",
    }),
  }),
} satisfies AuthDefinition;
