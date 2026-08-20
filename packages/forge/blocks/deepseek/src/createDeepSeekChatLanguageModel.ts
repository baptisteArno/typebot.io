import { createDeepSeek } from "@ai-sdk/deepseek";
import { safeFetch } from "@typebot.io/lib/safeFetch";

export const createDeepSeekChatLanguageModel = ({
  apiKey,
  baseUrl,
  modelName,
}: {
  apiKey: string;
  baseUrl: string | undefined;
  modelName: string;
}) =>
  createDeepSeek({
    apiKey,
    baseURL: baseUrl,
    fetch: safeFetch,
  })(modelName);
