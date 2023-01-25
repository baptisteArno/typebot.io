import { z } from 'zod'
import { blockBaseSchema } from '../baseSchemas'
import { LogicBlockType } from './enums'

export const codeOptionsSchema = z.object({
  name: z.string(),
  content: z.string().optional(),
  shouldExecuteInParentContext: z.boolean().optional(),
})

export const codeBlockSchema = blockBaseSchema.and(
  z.object({
    type: z.enum([LogicBlockType.CODE]),
    options: codeOptionsSchema,
  })
)

export const defaultCodeOptions: CodeOptions = { name: 'Code snippet' }

export type CodeBlock = z.infer<typeof codeBlockSchema>
export type CodeOptions = z.infer<typeof codeOptionsSchema>
