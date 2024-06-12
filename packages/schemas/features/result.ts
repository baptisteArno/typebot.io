import { z } from '../zod'
import { answerInputSchema, answerSchema } from './answer'
import { listVariableValue, variableWithValueSchema } from './typebot/variable'
import {
  Result as ResultPrisma,
  Log as LogPrisma,
  SetVariableHistoryItem as SetVariableHistoryItemPrisma,
  VisitedEdge,
} from '@typebot.io/prisma'
import { InputBlockType } from './blocks/inputs/constants'

export const resultSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  typebotId: z.string(),
  variables: z.array(variableWithValueSchema),
  isCompleted: z.boolean(),
  hasStarted: z.boolean().nullable(),
  isArchived: z.boolean().nullable(),
  lastChatSessionId: z.string().nullable(),
}) satisfies z.ZodType<ResultPrisma>

export const resultWithAnswersSchema = resultSchema.merge(
  z.object({
    answers: z.array(answerSchema),
  })
)

export const visitedEdgeSchema = z.object({
  edgeId: z.string(),
  resultId: z.string(),
  index: z.number(),
}) satisfies z.ZodType<VisitedEdge>

export const resultWithAnswersInputSchema = resultSchema.merge(
  z.object({
    answers: z.array(answerInputSchema),
  })
)

export const logSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  resultId: z.string(),
  status: z.string(),
  description: z.string(),
  details: z.string().nullable(),
}) satisfies z.ZodType<LogPrisma>

export type Result = z.infer<typeof resultSchema>
export type ResultWithAnswers = z.infer<typeof resultWithAnswersSchema>
export type ResultWithAnswersInput = z.infer<
  typeof resultWithAnswersInputSchema
>
export type Log = z.infer<typeof logSchema>

export type ResultValuesInput = Pick<
  ResultWithAnswersInput,
  'answers' | 'createdAt' | 'variables'
>

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

export type CellValueType = { element?: JSX.Element; plainText: string }

export type TableData = {
  id: Pick<CellValueType, 'plainText'>
} & Record<string, CellValueType>

export const setVariableHistoryItemSchema = z.object({
  resultId: z.string(),
  index: z.number(),
  blockId: z.string(),
  variableId: z.string(),
  value: z.string().or(listVariableValue).nullable(),
}) satisfies z.ZodType<SetVariableHistoryItemPrisma>
export type SetVariableHistoryItem = z.infer<
  typeof setVariableHistoryItemSchema
>
