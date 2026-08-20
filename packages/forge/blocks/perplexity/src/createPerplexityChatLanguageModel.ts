import { createPerplexity } from "@ai-sdk/perplexity";
import { safeFetch } from "@typebot.io/lib/safeFetch";

export const createPerplexityChatLanguageModel = ({
  apiKey,
  baseUrl,
  modelName,
}: {
  apiKey: string;
  baseUrl: string | undefined;
  modelName: string;
}) =>
  createPerplexity({
    apiKey,
    baseURL: baseUrl,
    fetch: safeFetch,
  })(modelName);
