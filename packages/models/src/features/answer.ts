import { z } from 'zod'

export const answerSchema = z.object({
  createdAt: z.date(),
  resultId: z.string(),
  blockId: z.string(),
  groupId: z.string(),
  variableId: z.string().nullable(),
  content: z.string(),
  storageUsed: z.number().nullable(),
})

export const answerInputSchema = answerSchema
  .omit({
    createdAt: true,
    resultId: true,
    variableId: true,
    storageUsed: true,
  })
  .and(
    z.object({
      variableId: z.string().nullish(),
      storageUsed: z.number().nullish(),
    })
  )

export type Stats = {
  totalViews: number
  totalStarts: number
  totalCompleted: number
}

export type Answer = z.infer<typeof answerSchema>

export type AnswerInput = z.infer<typeof answerInputSchema>
