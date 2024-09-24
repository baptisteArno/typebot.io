import { z } from '../../../../zod'
import { blockBaseSchema } from '../../shared'
import { LogicBlockType } from '../constants'
import { assignChatType, assignChatTypeOptions } from './constants'

export const assignChatOptionsSchema = z.object({
  assignType: z.enum(assignChatTypeOptions).optional(),
  email: z.string().email().optional(),
})

export const assignChatBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.ASSIGN_CHAT]),
    options: assignChatOptionsSchema.optional(),
  })
)

export type AssignChatBlock = z.infer<typeof assignChatBlockSchema>
