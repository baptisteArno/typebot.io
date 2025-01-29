import { option } from "@typebot.io/forge";
import type { AuthDefinition } from "@typebot.io/forge/types";
import { defaultHost } from "./constants";

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
      defaultValue: defaultHost,
    }),
  }),
} satisfies AuthDefinition;
