import { createAuth, option } from "@typebot.io/forge";
import { defaultFamulorOrigin } from "./constants";

export const auth = createAuth({
  type: "encryptedCredentials",
  name: "Famulor account",
  schema: option.object({
    apiKey: option.string.meta({
      layout: {
        label: "API key",
        isRequired: true,
        inputType: "password",
        helperText:
          "Create a key under Settings → API & MCP. It starts with `fam_`. [Famulor API docs](https://docs.famulor.io/api-reference/introduction).",
        withVariableButton: false,
        isDebounceDisabled: true,
      },
    }),
    baseUrl: option.string.meta({
      layout: {
        label: "API base URL",
        defaultValue: defaultFamulorOrigin,
        placeholder: defaultFamulorOrigin,
        helperText:
          "White-label hosts only. The block calls /api/v1 on this origin. Leave the default for app.famulor.io.",
        withVariableButton: false,
        isDebounceDisabled: true,
      },
    }),
  }),
});
