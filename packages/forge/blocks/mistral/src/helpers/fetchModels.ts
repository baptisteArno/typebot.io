import ky from "ky";
import { apiBaseUrl } from "../constants";

export const fetchModels = async ({
  credentials,
}: {
  credentials?: { apiKey?: string };
}) => {
  if (!credentials?.apiKey) return [];

  const { data } = await ky
    .get(apiBaseUrl + "/v1/models", {
      headers: {
        Authorization: `Bearer ${credentials.apiKey}`,
      },
    })
    .json<{
      data: {
        id: string;
        created: number;
        deprecation?: string;
        capabilities: {
          completion_chat: boolean;
        };
      }[];
    }>();

  return data
    .filter((model) => model.capabilities.completion_chat && !model.deprecation)
    .sort((a, b) => b.created - a.created)
    .map((model) => model.id);
};
