import { z } from 'zod'
import { answerSchema } from './answer'
import { InputBlockType } from './blocks'
import { variableWithValueSchema } from './typebot/variable'

export const resultSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  typebotId: z.string(),
  variables: z.array(variableWithValueSchema),
  isCompleted: z.boolean(),
  hasStarted: z.boolean().nullable(),
  isArchived: z.boolean().nullable(),
})

export const resultWithAnswersSchema = resultSchema.and(
  z.object({
    answers: z.array(answerSchema),
  })
)

export const logSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  resultId: z.string(),
  status: z.string(),
  description: z.string(),
  details: z.string().nullable(),
})

export type Result = z.infer<typeof resultSchema>

export type ResultWithAnswers = z.infer<typeof resultWithAnswersSchema>

export type Log = z.infer<typeof logSchema>

export type ResultValues = Pick<
  ResultWithAnswers,
  'answers' | 'createdAt' | 'variables'
>

export type ResultHeaderCell = {
  id: string
  label: string
  blocks?: {
    id: string
    groupId: string
  }[]
  blockType?: InputBlockType
  variableIds?: string[]
}
