import { safeFetch } from "@typebot.io/lib/safeFetch";
import { PostHog } from "posthog-node";
import { defaultHost } from "../constants";

export const createClient = (apiKey: string, host = defaultHost) => {
  return new PostHog(apiKey, {
    host,
    requestTimeout: 5000,
    fetch: safeFetch,
  });
};
