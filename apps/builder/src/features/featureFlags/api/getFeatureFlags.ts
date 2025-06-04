import { authenticatedProcedure } from "@/helpers/server/trpc";
import { env } from "@typebot.io/env";
import { z } from "@typebot.io/zod";
import { PostHog } from "posthog-node";

const flagsSchema = z.object({
  flags: z.record(z.enum(["cards"]), z.boolean()),
});

export const getFeatureFlags = authenticatedProcedure
  .output(flagsSchema)
  .query(async ({ ctx: { user } }) => {
    if (!env.NEXT_PUBLIC_POSTHOG_KEY) return { flags: {} };
    const client = new PostHog(env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: env.POSTHOG_API_HOST,
    });
    return { flags: await client.getAllFlags(user.id) };
  });
