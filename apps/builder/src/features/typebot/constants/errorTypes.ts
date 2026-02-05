import { z } from 'zod'

export const errorTypeEnum = z.enum([
  'conditionalBlocks',
  'missingTextBeforeClaudia',
  'brokenLinks',
  'missingTextBetweenInputBlocks',
  'missingClaudiaInFlowBranches',
  'missingWorkflowEndInFlowBranches',
])
export type ErrorType = z.infer<typeof errorTypeEnum>

const validationErrorItemSchema = z.object({
  groupId: z.string().optional(),
  type: errorTypeEnum,
  message: z.string().optional(),
})

export const validationErrorSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(validationErrorItemSchema),
})

export type ValidationErrorItem = z.infer<typeof validationErrorItemSchema>
export type ValidationErrorItemWithGroupName = ValidationErrorItem & {
  groupName: string
}
export type ValidationError = z.infer<typeof validationErrorSchema>
