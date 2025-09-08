import { z } from 'zod'

export const errorTypeEnum = z.enum([
  'conditionalBlocks',
  'invalidTextBeforeClaudia',
  'brokenLinks',
  'outgoingEdgeIds',
])
export type ErrorType = z.infer<typeof errorTypeEnum>

const BaseError = z.object({
  groupId: z.string().optional(),
})

export const conditionalBlocksErrorSchema = BaseError.extend({
  type: z.literal('conditionalBlocks'),
})

export const outgoingEdgeIdsErrorSchema = BaseError.extend({
  type: z.literal('outgoingEdgeIds'),
})

export const invalidTextBeforeClaudiaErrorSchema = BaseError.extend({
  type: z.literal('invalidTextBeforeClaudia'),
})

export const brokenLinksErrorSchema = BaseError.extend({
  type: z.literal('brokenLinks'),
  typebotName: z.string(),
})

export const validationErrorItemSchema = z.discriminatedUnion('type', [
  conditionalBlocksErrorSchema,
  outgoingEdgeIdsErrorSchema,
  invalidTextBeforeClaudiaErrorSchema,
  brokenLinksErrorSchema,
])

export const validationErrorSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(validationErrorItemSchema),
})

export type ConditionalGroupsError = z.infer<
  typeof conditionalBlocksErrorSchema
>
export type OutgoingEdgeIdsError = z.infer<typeof outgoingEdgeIdsErrorSchema>
export type InvalidTextBeforeClaudiaError = z.infer<
  typeof invalidTextBeforeClaudiaErrorSchema
>
export type BrokenLinksError = z.infer<typeof brokenLinksErrorSchema>
export type ValidationErrorItem = z.infer<typeof validationErrorItemSchema>
export type ValidationError = z.infer<typeof validationErrorSchema>
