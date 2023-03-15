import { z } from 'zod'

export const invoiceSchema = z.object({
  id: z.string(),
  url: z.string(),
  amount: z.number(),
  currency: z.string(),
  date: z.number().nullable(),
})

export type Invoice = z.infer<typeof invoiceSchema>
