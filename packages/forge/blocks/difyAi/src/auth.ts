import { createAuth, option } from "@typebot.io/forge";
import { isURL } from "@typebot.io/lib/isURL";
import { defaultBaseUrl } from "./constants";

const extractBaseUrl = (val: string | undefined) => {
  if (!val) return val;
  const url = new URL(val);
  return url.origin;
};

export const auth = createAuth({
  type: "encryptedCredentials",
  name: "Dify.AI account",
  schema: option.object({
    apiKey: option.string.meta({
      layout: {
        label: "App API key",
        inputType: "password",
        placeholder: "app-...",
        withVariableButton: false,
        isDebounceDisabled: true,
      },
    }),
    knowledgeApiKey: option.string.meta({
      layout: {
        label: "Knowledge API key",
        inputType: "password",
        placeholder: "dataset-...",
        withVariableButton: false,
      },
    }),
    apiEndpoint: option.string
      .meta({
        layout: {
          label: "API Endpoint",
          isRequired: true,
          withVariableButton: false,
          defaultValue: defaultBaseUrl,
          accordion: "Advanced settings",
        },
      })
      .refine((val) => !val || isURL(val))
      .transform(extractBaseUrl),
  }),
});
