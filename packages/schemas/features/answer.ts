import { z } from '../zod'
import { Answer as AnswerV1Prisma, Prisma } from '@typebot.io/prisma'

const answerV1Schema = z.object({
  createdAt: z.date(),
  resultId: z.string(),
  blockId: z.string(),
  groupId: z.string(),
  variableId: z.string().nullable(),
  content: z.string(),
}) satisfies z.ZodType<AnswerV1Prisma>

export const answerSchema = z.object({
  blockId: z.string(),
  content: z.string(),
  attachedFileUrls: z.array(z.string()).optional(),
})

export const answerInputSchema = answerV1Schema
  .omit({
    createdAt: true,
    resultId: true,
    variableId: true,
  })
  .extend({
    variableId: z.string().nullish(),
  }) satisfies z.ZodType<Prisma.AnswerUncheckedUpdateInput>

export const statsSchema = z.object({
  totalViews: z.number(),
  totalStarts: z.number(),
  totalCompleted: z.number(),
})

export type Stats = z.infer<typeof statsSchema>

export type Answer = z.infer<typeof answerSchema>

export type AnswerInput = z.infer<typeof answerInputSchema>
