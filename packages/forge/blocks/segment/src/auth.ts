import { option } from "@typebot.io/forge";
import type { AuthDefinition } from "@typebot.io/forge/types";

export const auth = {
  type: "encryptedCredentials",
  name: "Segment account",
  schema: option.object({
    apiKey: option.string.layout({
      label: "Write Key",
      isRequired: true,
      inputType: "password",
      helperText:
        "You can find your Write Key in your Segment source settings.",
      withVariableButton: false,
      isDebounceDisabled: true,
    }),
  }),
} satisfies AuthDefinition;
