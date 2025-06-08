import { env } from "@typebot.io/env";
import ky from "ky";

export const getPostHogPerson = async (userId: string) => {
  if (!env.POSTHOG_PERSONAL_API_KEY || !env.POSTHOG_PROJECT_ID) return;

  const response = await ky
    .get(
      `${env.POSTHOG_API_HOST}/api/projects/${env.POSTHOG_PROJECT_ID}/persons`,
      {
        searchParams: {
          search: userId,
        },
        headers: {
          Authorization: `Bearer ${env.POSTHOG_PERSONAL_API_KEY}`,
        },
      },
    )
    .json<{
      results?: {
        id: string;
        distinct_ids: string[];
      }[];
    }>();

  return response.results?.[0];
};
