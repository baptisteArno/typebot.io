import { safeFetch } from "@typebot.io/lib/safeFetch";
import { createDifyProvider, type DifyProvider } from "dify-ai-provider";
import { defaultAppId } from "../constants";
import { transformKeyValueListToObject } from "../helpers/transformKeyValueListToObject";

export const createDifyChatLanguageModel = ({
  apiEndpoint,
  apiKey,
  inputs,
  responseMode,
}: CreateDifyChatLanguageModelProps): ReturnType<DifyProvider> =>
  createDifyProvider({
    baseURL: `${apiEndpoint}/v1`,
    // dify-ai-provider 1.1.0 is patched to forward this to chat and uploads.
    fetch: safeFetch,
  })(defaultAppId, {
    apiKey,
    inputs: transformKeyValueListToObject(inputs),
    responseMode,
  });

type CreateDifyChatLanguageModelProps = {
  apiEndpoint: string;
  apiKey: string;
  inputs?: { key?: string; value?: unknown }[];
  responseMode: "blocking" | "streaming";
};
