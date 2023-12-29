import { z } from '../zod'

export const totalAnswersSchema = z.object({
  blockId: z.string(),
  itemId: z.string().optional(),
  total: z.number(),
})
export type TotalAnswers = z.infer<typeof totalAnswersSchema>

export const totalVisitedEdgesSchema = z.object({
  edgeId: z.string(),
  total: z.number(),
})
export type TotalVisitedEdges = z.infer<typeof totalVisitedEdgesSchema>
