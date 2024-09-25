import OpenAI, { type ClientOptions } from "openai";

type Props = {
  apiKey?: string;
  baseUrl?: string;
  apiVersion?: string;
};

export const fetchGPTModels = async ({
  apiKey,
  baseUrl,
  apiVersion,
}: Props) => {
  if (!apiKey) return [];

  const config = {
    apiKey: apiKey,
    baseURL: baseUrl,
    defaultHeaders: {
      "api-key": apiKey,
    },
    defaultQuery: apiVersion
      ? {
          "api-version": apiVersion,
        }
      : undefined,
  } satisfies ClientOptions;

  const openai = new OpenAI(config);

  const models = await openai.models.list();

  return (
    models.data
      .filter((model) => model.id.includes("gpt"))
      .sort((a, b) => b.created - a.created)
      .map((model) => model.id) ?? []
  );
};
