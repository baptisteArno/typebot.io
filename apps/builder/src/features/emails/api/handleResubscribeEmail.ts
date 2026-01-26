import prisma from "@typebot.io/prisma";
import { normalizeEmail } from "@typebot.io/user/normalizeEmail";
import { verifyUnsubscribeToken } from "@typebot.io/user/verifyUnsubscribeToken";
import { z } from "zod";

const resubscribeStatusSchema = z.enum([
  "resubscribed",
  "already-subscribed",
  "blocked",
  "unknown",
  "invalid",
]);

export const resubscribeEmailOutputSchema = z.object({
  status: resubscribeStatusSchema,
});

export type ResubscribeStatus = z.infer<typeof resubscribeStatusSchema>;
type ResubscribeResponse = z.infer<typeof resubscribeEmailOutputSchema>;

export const resubscribeEmailInputSchema = z.object({
  query: z
    .object({
      email: z.string().optional(),
      token: z.string().optional(),
    })
    .optional(),
});

export const handleResubscribeEmail = async ({
  input,
}: {
  input: z.infer<typeof resubscribeEmailInputSchema>;
}): Promise<ResubscribeResponse> => {
  const email = input.query?.email ?? "";
  const token = input.query?.token ?? "";
  if (!email || !token) return { status: "invalid" };
  if (!verifyUnsubscribeToken(email, token)) return { status: "invalid" };

  const status = await clearSuppression(email);
  return { status };
};

const clearSuppression = async (email: string): Promise<ResubscribeStatus> => {
  const normalized = normalizeEmail(email);
  if (!normalized) return "unknown";
  const suppressed = await prisma.suppressedEmail.findUnique({
    where: { email: normalized },
    select: { suppressedAt: true, transientGeneralBounceCount: true },
  });
  if (!suppressed) return "already-subscribed";
  if (suppressed.transientGeneralBounceCount >= 2) return "blocked";
  if (!suppressed.suppressedAt) return "already-subscribed";
  await prisma.suppressedEmail.update({
    where: { email: normalized },
    data: { suppressedAt: null },
  });
  return "resubscribed";
};
