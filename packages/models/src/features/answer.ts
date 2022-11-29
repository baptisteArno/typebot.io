import { z } from 'zod'
import { schemaForType } from './utils'
import { Answer as AnswerPrisma, Prisma } from 'db'

export const answerSchema = schemaForType<AnswerPrisma>()(
  z.object({
    createdAt: z.date(),
    resultId: z.string(),
    blockId: z.string(),
    groupId: z.string(),
    variableId: z.string().nullable(),
    content: z.string(),
    storageUsed: z.number().nullable(),
  })
)

export const answerInputSchema =
  schemaForType<Prisma.AnswerUncheckedUpdateInput>()(
    answerSchema
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
  )

export type Stats = {
  totalViews: number
  totalStarts: number
  totalCompleted: number
}

export type Answer = z.infer<typeof answerSchema>

export type AnswerInput = z.infer<typeof answerInputSchema>
