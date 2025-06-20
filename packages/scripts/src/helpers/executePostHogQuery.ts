import { env } from "@typebot.io/env";
import ky from "ky";

export interface PostHogHogQLResponse {
  results: number[][];
  columns: string[];
}

export const executePostHogQuery = async (
  query: string,
): Promise<PostHogHogQLResponse> => {
  if (!env.POSTHOG_PERSONAL_API_KEY || !env.POSTHOG_PROJECT_ID) {
    throw new Error("PostHog API credentials not configured");
  }

  const hogqlQuery = {
    query: {
      kind: "HogQLQuery",
      query,
    },
  };

  try {
    const response = await ky
      .post(
        `${env.POSTHOG_API_HOST}/api/projects/${env.POSTHOG_PROJECT_ID}/query/`,
        {
          headers: {
            Authorization: `Bearer ${env.POSTHOG_PERSONAL_API_KEY}`,
            "Content-Type": "application/json",
          },
          json: hogqlQuery,
        },
      )
      .json<PostHogHogQLResponse>();

    return response;
  } catch (error) {
    console.error("Error executing PostHog query:", error);
    throw error;
  }
};
