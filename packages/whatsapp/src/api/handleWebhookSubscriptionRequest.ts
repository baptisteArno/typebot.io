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
  // Better Auth uses 'verification' model with 'value' field instead of 'verificationToken' with 'token'
  const verification = await prisma.verification.findFirst({
    where: {
      value: token,
    },
  });
  if (!verification)
    throw new ORPCError("UNAUTHORIZED", {
      message: "Unauthorized",
    });
  await prisma.verification.delete({
    where: {
      id: verification.id,
    },
  });
  return Number(challenge);
};
