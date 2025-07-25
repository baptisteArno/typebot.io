import { defaultBaseUrl } from "../constants";

export const validateCredentials = (
  apiEndpoint: string | undefined,
  apiKey: string | undefined,
):
  | {
      success: true;
      apiKey: string;
      apiEndpoint: string | undefined;
    }
  | { success: false; error: string } => {
  if (!apiKey?.trim()) return { success: false, error: "No API key provided" };

  return {
    success: true,
    apiKey: apiKey.trim(),
    apiEndpoint: apiEndpoint?.trim() ?? defaultBaseUrl,
  };
};
