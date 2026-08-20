import { createGroq } from "@ai-sdk/groq";
import { safeFetch } from "@typebot.io/lib/safeFetch";

export const createGroqChatLanguageModel = ({
  apiKey,
  baseUrl,
  modelName,
}: {
  apiKey: string;
  baseUrl: string | undefined;
  modelName: string;
}) =>
  createGroq({
    apiKey,
    baseURL: baseUrl,
    fetch: safeFetch,
  })(modelName);
