import { option } from "@typebot.io/forge";
import type { AuthDefinition } from "@typebot.io/forge/types";
import { isURL } from "@typebot.io/lib/isURL";
import { defaultBaseUrl } from "./constants";

const extractBaseUrl = (val: string | undefined) => {
  if (!val) return val;
  const url = new URL(val);
  return url.origin;
};

export const auth = {
  type: "encryptedCredentials",
  name: "Dify.AI account",
  schema: option.object({
    apiEndpoint: option.string
      .layout({
        label: "API Endpoint",
        isRequired: true,
        withVariableButton: false,
        defaultValue: defaultBaseUrl,
      })
      .refine((val) => !val || isURL(val))
      .transform(extractBaseUrl),
    apiKey: option.string.layout({
      label: "App API key",
      inputType: "password",
      placeholder: "app-...",
      withVariableButton: false,
      isDebounceDisabled: true,
    }),
    knowledgeApiKey: option.string.layout({
      label: "Knowledge API key",
      inputType: "password",
      placeholder: "dataset-...",
      withVariableButton: false,
    }),
  }),
} satisfies AuthDefinition;
