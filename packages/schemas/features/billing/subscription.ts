import { z } from 'zod'

export const subscriptionSchema = z.object({
  isYearly: z.boolean(),
  currency: z.enum(['eur', 'usd']),
  cancelDate: z.date().optional(),
})

export type Subscription = z.infer<typeof subscriptionSchema>
