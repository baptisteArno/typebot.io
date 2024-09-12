import { z } from '../../../../zod'
import { blockBaseSchema } from '../../shared'
import { assignChatTypeOptions, LogicBlockType } from '../constants'

export const assignChatOptionsSchema = z.object({
  assignType: z.enum(assignChatTypeOptions).optional(),
  email: z.string().optional(),
})

export const assignChatBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.ASSIGN_CHAT]),
    options: assignChatOptionsSchema,
  })
)

export type AssignChatBlock = z.infer<typeof assignChatBlockSchema>
