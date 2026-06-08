import { createOpenAI, type OpenAIProviderSettings } from "@ai-sdk/openai";

type Props = {
  apiKey: string;
  baseUrl: string | undefined;
  modelName: string;
  fetch?: OpenAIProviderSettings["fetch"];
};

export const createOpenAIChatLanguageModel = ({
  apiKey,
  baseUrl,
  modelName,
  fetch,
}: Props) =>
  createOpenAI({
    baseURL: baseUrl,
    apiKey,
    fetch,
  }).chat(modelName);
