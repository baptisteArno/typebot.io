import { z } from 'zod'
import { blockBaseSchema } from '../baseSchemas'
import { LogicBlockType } from './enums'

export const scriptOptionsSchema = z.object({
  name: z.string(),
  content: z.string().optional(),
  shouldExecuteInParentContext: z.boolean().optional(),
})

export const scriptBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.SCRIPT]),
    options: scriptOptionsSchema,
  })
)

export const defaultScriptOptions: ScriptOptions = { name: 'Script' }

export type ScriptBlock = z.infer<typeof scriptBlockSchema>
export type ScriptOptions = z.infer<typeof scriptOptionsSchema>
