import { z } from 'zod'
import { blockBaseSchema } from '../baseSchemas'
import { LogicBlockType } from './enums'

export const jumpOptionsSchema = z.object({
  groupId: z.string().optional(),
  blockId: z.string().optional(),
})

export const jumpBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.JUMP]),
    options: jumpOptionsSchema,
  })
)

export type JumpBlock = z.infer<typeof jumpBlockSchema>
