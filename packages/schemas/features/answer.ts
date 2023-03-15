import { z } from 'zod'
import { Answer as AnswerPrisma, Prisma } from '@typebot.io/prisma'

export const answerSchema = z.object({
  createdAt: z.date(),
  resultId: z.string(),
  blockId: z.string(),
  groupId: z.string(),
  variableId: z.string().nullable(),
  content: z.string(),
  storageUsed: z.number().nullable(),
}) satisfies z.ZodType<AnswerPrisma>

export const answerInputSchema = answerSchema
  .omit({
    createdAt: true,
    resultId: true,
    variableId: true,
    storageUsed: true,
  })
  .merge(
    z.object({
      variableId: z.string().nullish(),
      storageUsed: z.number().nullish(),
    })
  ) satisfies z.ZodType<Prisma.AnswerUncheckedUpdateInput>

export type Stats = {
  totalViews: number
  totalStarts: number
  totalCompleted: number
}

export type Answer = z.infer<typeof answerSchema>

export type AnswerInput = z.infer<typeof answerInputSchema>
