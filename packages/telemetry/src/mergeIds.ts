import { env } from "@typebot.io/env";
import { PostHog } from "posthog-node";
import { getPostHogPerson } from "./getPostHogPerson";

/**
 * Alias visitorId with userId on PostHog only if the visitorId has events.
 */
export const mergeIds = async ({
  visitorId,
  userId,
}: {
  visitorId: string;
  userId: string;
}) => {
  if (!env.NEXT_PUBLIC_POSTHOG_KEY || !env.POSTHOG_PERSONAL_API_KEY) return;
  const client = new PostHog(env.NEXT_PUBLIC_POSTHOG_KEY, {
    host: env.POSTHOG_API_HOST,
  });

  const existingPerson = await getPostHogPerson(visitorId);
  if (existingPerson) return;

  client.alias({
    distinctId: visitorId,
    alias: userId,
  });

  try {
    await client.shutdown();
  } catch (err) {
    console.error("ERROR while tracking events", err);
  }
};
