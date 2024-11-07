import { z } from 'zod'
import { blockBaseSchema } from '../../shared'
import { LogicBlockType } from '../constants'

export const globalJumpOptionsSchema = z.object({
  text: z.string().optional(),
  groupId: z.string().optional(),
  blockId: z.string().optional(),
})

export const globalJumpBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.GLOBAL_JUMP]),
    options: globalJumpOptionsSchema.optional(),
  })
)

export type GlobalJumpBlock = z.infer<typeof globalJumpBlockSchema>
