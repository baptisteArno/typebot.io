import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { env } from "@typebot.io/env";
import { PostHog } from "posthog-node";
import { z } from "zod";

const flagsSchema = z.object({
  flags: z.record(z.enum(["cards", "360dialog"]), z.boolean()),
});

export const getFeatureFlags = authenticatedProcedure
  .output(flagsSchema)
  .handler(async ({ context: { user } }) => {
    if (!env.NEXT_PUBLIC_POSTHOG_KEY)
      return { flags: { "360dialog": false, cards: false } };
    const client = new PostHog(env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: env.POSTHOG_API_HOST,
    });
    const rawFlags = await client.getAllFlags(user.id);
    return {
      flags: {
        "360dialog": Boolean(rawFlags["360dialog"]),
        cards: Boolean(rawFlags.cards),
      },
    };
  });
