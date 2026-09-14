import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { env } from "@typebot.io/env";
import { signWebhookToken } from "@typebot.io/lib/signWebhookToken";
import { getTestWebhookRoom } from "@typebot.io/webhook-block/api/getTestWebhookRoom";
import { z } from "zod";

export const getWebhookSubscription = authenticatedProcedure
  .input(z.object({ typebotId: z.string(), blockId: z.string() }))
  .handler(async ({ input: { typebotId, blockId }, context: { user } }) => {
    const room = await getTestWebhookRoom(typebotId, blockId, user);
    return {
      token: await signWebhookToken(
        {
          purpose: "subscribe",
          room,
          blockId,
          nonce: crypto.randomUUID(),
          expiresAt: Date.now() + 15 * 60 * 1000,
        },
        env.WEBHOOK_RELAY_SECRET,
      ),
    };
  });
