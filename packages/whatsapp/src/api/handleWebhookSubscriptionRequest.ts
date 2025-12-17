import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";

export const webhookSubscriptionInputSchema = z.object({
  workspaceId: z.string(),
  credentialsId: z.string(),
  "hub.challenge": z.string(),
  "hub.verify_token": z.string(),
});

export const handleWebhookSubscriptionRequest = async ({
  input: { "hub.challenge": challenge, "hub.verify_token": token },
}: {
  input: z.infer<typeof webhookSubscriptionInputSchema>;
}) => {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: {
      token,
    },
  });
  if (!verificationToken)
    throw new ORPCError("UNAUTHORIZED", {
      message: "Unauthorized",
    });
  await prisma.verificationToken.delete({
    where: {
      token,
    },
  });
  return Number(challenge);
};
