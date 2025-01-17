import { PostHog } from "posthog-node";

export const createClient = (apiKey: string, host: string) => {
  return new PostHog(apiKey, { host: host, requestTimeout: 5000 });
};
