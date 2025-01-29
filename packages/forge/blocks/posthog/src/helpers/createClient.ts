import { PostHog } from "posthog-node";
import { defaultHost } from "../constants";

export const createClient = (apiKey: string, host = defaultHost) => {
  return new PostHog(apiKey, { host: host, requestTimeout: 5000 });
};
