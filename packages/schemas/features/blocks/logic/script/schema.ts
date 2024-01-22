import { z } from '../../../../zod'
import { blockBaseSchema } from '../../shared'
import { LogicBlockType } from '../constants'

export const scriptOptionsSchema = z.object({
  name: z.string().optional(),
  content: z.string().optional(),
  isExecutedOnClient: z.boolean().optional(),
  shouldExecuteInParentContext: z.boolean().optional(),
})

export const scriptBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.SCRIPT]),
    options: scriptOptionsSchema.optional(),
  })
)

export type ScriptBlock = z.infer<typeof scriptBlockSchema>
