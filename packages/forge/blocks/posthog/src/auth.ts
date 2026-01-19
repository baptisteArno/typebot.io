import { createAuth, option } from "@typebot.io/forge";
import { defaultHost } from "./constants";

export const auth = createAuth({
  type: "encryptedCredentials",
  name: "Posthog account",
  schema: option.object({
    apiKey: option.string.meta({
      layout: {
        label: "Project API key",
        isRequired: true,
        inputType: "password",
        withVariableButton: false,
        isDebounceDisabled: true,
      },
    }),
    host: option.string.meta({
      layout: {
        label: "Host",
        withVariableButton: false,
        isDebounceDisabled: true,
        defaultValue: defaultHost,
      },
    }),
  }),
});
