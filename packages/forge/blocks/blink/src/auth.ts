import { createAuth, option } from "@typebot.io/forge";

export const auth = createAuth({
  type: "encryptedCredentials",
  name: "Blink app",
  schema: option.object({
    apiKey: option.string.meta({
      layout: {
        label: "Legacy app token",
        inputType: "password",
        helperText:
          "Used by the Get Users and Send Feed Event actions. New Blink credentials use an App Identity instead.",
        withVariableButton: false,
        isDebounceDisabled: true,
        isHidden: (credentials: Record<string, unknown> | undefined) =>
          !isLegacyAppCredentials(credentials),
      },
    }),
    clientId: option.string.meta({
      layout: {
        label: "Client ID",
        placeholder: "aid-...",
        helperText:
          "Create an App Identity in your Blink Admin portal (Manage Apps > Created apps > Create app > App identity), then copy its client ID and client secret. [See how](https://docs.typebot.com/editor/blocks/integrations/blink#create-a-blink-app-identity).",
        withVariableButton: false,
        isDebounceDisabled: true,
        isHidden: isLegacyAppCredentials,
      },
    }),
    clientSecret: option.string.meta({
      layout: {
        label: "Client secret",
        inputType: "password",
        withVariableButton: false,
        isDebounceDisabled: true,
        isHidden: isLegacyAppCredentials,
      },
    }),
  }),
});

function isLegacyAppCredentials(
  credentials: Record<string, unknown> | undefined,
) {
  return credentials !== undefined && Object.hasOwn(credentials, "apiKey");
}
