import { z } from '../../../../zod'
import { blockBaseSchema } from '../../shared'
import { LogicBlockType } from '../constants'
import { assignChatType, assignChatTypeOptions } from './constants'

export const assignChatOptionsSchema = z
  .object({
    assignType: z.enum(assignChatTypeOptions),
    email: z.string().email().optional(),
    name: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.assignType === assignChatType.AGENT) {
        return !!data.email
      }
      if (data.assignType === assignChatType.TEAM) {
        return !!data.name
      }
      return true
    },
    {
      message:
        'Email is required when assigning to Agent, and Name is required when assigning to Team',
      path: ['assignType'],
    }
  )

export const assignChatBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.ASSIGN_CHAT]),
    options: assignChatOptionsSchema,
  })
)

export type AssignChatBlock = z.infer<typeof assignChatBlockSchema>
