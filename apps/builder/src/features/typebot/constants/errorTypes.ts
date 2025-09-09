import { z } from 'zod'

export const errorTypeEnum = z.enum([
  'conditionalBlocks',
  'missingTextBeforeClaudia',
  'brokenLinks',
  'outgoingEdgeIds',
  'missingTextBetweenInputBlocks',
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

export const missingTextBeforeClaudiaErrorSchema = BaseError.extend({
  type: z.literal('missingTextBeforeClaudia'),
})

export const missingTextBetweenInputBlocksErrorSchema = BaseError.extend({
  type: z.literal('missingTextBetweenInputBlocks'),
})

export const brokenLinksErrorSchema = BaseError.extend({
  type: z.literal('brokenLinks'),
  typebotName: z.string(),
})

export const validationErrorItemSchema = z.discriminatedUnion('type', [
  conditionalBlocksErrorSchema,
  outgoingEdgeIdsErrorSchema,
  missingTextBeforeClaudiaErrorSchema,
  brokenLinksErrorSchema,
  missingTextBetweenInputBlocksErrorSchema,
])

export const validationErrorSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(validationErrorItemSchema),
})

export type ConditionalGroupsError = z.infer<
  typeof conditionalBlocksErrorSchema
>
export type OutgoingEdgeIdsError = z.infer<typeof outgoingEdgeIdsErrorSchema>
export type missingTextBeforeClaudiaError = z.infer<
  typeof missingTextBeforeClaudiaErrorSchema
>
export type BrokenLinksError = z.infer<typeof brokenLinksErrorSchema>
export type ValidationErrorItem = z.infer<typeof validationErrorItemSchema>
export type ValidationErrorItemWithGroupName = ValidationErrorItem & {
  groupName: string
}
export type ValidationError = z.infer<typeof validationErrorSchema>
