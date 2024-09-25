import { z } from "@typebot.io/zod";

export const subscriptionSchema = z.object({
  currentBillingPeriod: z.object({
    start: z.date(),
    end: z.date(),
  }),
  currency: z.enum(["eur", "usd"]),
  cancelDate: z.date().optional(),
  status: z.enum(["active", "past_due"]),
});

export type Subscription = z.infer<typeof subscriptionSchema>;
