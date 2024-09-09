import { z } from '../../../../zod'
import { blockBaseSchema } from '../../shared'
import { LogicBlockType } from '../constants'

export const assignChatOptionsSchema = z.object({
  email: z.string().optional(),
})

export const assignChatBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.ASSIGN_CHAT]),
    options: assignChatOptionsSchema.optional(),
  })
)

export type AssignChatBlock = z.infer<typeof assignChatBlockSchema>
