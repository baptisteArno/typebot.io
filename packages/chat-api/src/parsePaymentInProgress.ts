import { z } from "zod";
import { startChatResponseSchema } from "./schemas";

export const parsePaymentInProgress = (value: string | null) => {
  if (!value) return;
  try {
    const parsed = paymentInProgressSchema.safeParse(JSON.parse(value));
    return parsed.success ? parsed.data : undefined;
  } catch {
    return;
  }
};

export const paymentInProgressStorageKey = "typebotPaymentInProgress";

const paymentInProgressSchema = startChatResponseSchema
  .pick({
    sessionId: true,
    resultId: true,
    typebot: true,
    previewWebhookRoom: true,
  })
  .extend({ isPreview: z.boolean().optional() });
