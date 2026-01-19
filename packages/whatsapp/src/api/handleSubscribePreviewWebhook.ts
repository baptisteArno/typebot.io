import { ORPCError } from "@orpc/server";
import { env } from "@typebot.io/env";
import { z } from "zod";

export const subscribePreviewWebhookInputSchema = z.object({
  "hub.challenge": z.string(),
  "hub.verify_token": z.string(),
});

export const handleSubscribePreviewWebhook = async ({
  input: { "hub.challenge": challenge, "hub.verify_token": token },
}: {
  input: z.infer<typeof subscribePreviewWebhookInputSchema>;
}) => {
  if (token !== env.ENCRYPTION_SECRET)
    throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
  return Number(challenge);
};
