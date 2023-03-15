import { z } from 'zod'

export const subscriptionSchema = z.object({
  additionalChatsIndex: z.number(),
  additionalStorageIndex: z.number(),
  currency: z.enum(['eur', 'usd']),
})

export type Subscription = z.infer<typeof subscriptionSchema>
