import { z } from 'zod'

export const totalAnswersInBlock = z.object({
  blockId: z.string(),
  itemId: z.string().optional(),
  total: z.number(),
})

export type TotalAnswersInBlock = z.infer<typeof totalAnswersInBlock>
