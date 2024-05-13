import { z } from '../zod'
import { Answer as AnswerPrisma, Prisma } from '@typebot.io/prisma'

export const answerSchema = z.object({
  id: z.number(),
  createdAt: z.date(),
  resultId: z.string(),
  blockId: z.string(),
  groupId: z.string(),
  variableId: z.string().nullable(),
  content: z.string(),
}) satisfies z.ZodType<AnswerPrisma>

export const answerInputSchema = answerSchema
  .omit({
    createdAt: true,
    resultId: true,
    variableId: true,
    storageUsed: true,
  })
  .extend({
    variableId: z.string().nullish(),
    storageUsed: z.number().nullish(),
  }) satisfies z.ZodType<Prisma.AnswerUncheckedUpdateInput>

export const statsSchema = z.object({
  totalViews: z.number(),
  totalStarts: z.number(),
  totalCompleted: z.number(),
})

export type Stats = z.infer<typeof statsSchema>

export type Answer = z.infer<typeof answerSchema>

export type AnswerInput = z.infer<typeof answerInputSchema>
