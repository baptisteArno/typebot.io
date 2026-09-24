import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { safeFetch } from "@typebot.io/lib/safeFetch";
import { defaultBaseUrl } from "./constants";

export const createLiteLLMChatLanguageModel = ({
  apiKey,
  baseUrl,
  modelName,
}: {
  apiKey: string;
  baseUrl: string | undefined;
  modelName: string;
}) =>
  createOpenAICompatible({
    name: "litellm",
    apiKey,
    baseURL: baseUrl ?? defaultBaseUrl,
    fetch: safeFetch,
  }).chatModel(modelName);
