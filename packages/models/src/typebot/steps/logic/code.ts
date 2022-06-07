import { z } from 'zod'
import { LogicStepType, stepBaseSchema } from '../shared'

export const codeOptionsSchema = z.object({
  name: z.string(),
  content: z.string().optional(),
})

export const codeStepSchema = stepBaseSchema.and(
  z.object({
    type: z.enum([LogicStepType.CODE]),
    options: codeOptionsSchema,
  })
)

export const defaultCodeOptions: CodeOptions = { name: 'Code snippet' }

export type CodeStep = z.infer<typeof codeStepSchema>
export type CodeOptions = z.infer<typeof codeOptionsSchema>
