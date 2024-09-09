import { z } from '../../../../zod'
import { blockBaseSchema } from '../../shared'
import { LogicBlockType } from '../constants'

// export const closeChatOptionsSchema = z.object({
//   groupId: z.string().optional(),
//   blockId: z.string().optional(),
// })

export const closeChatBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.CLOSE_CHAT]),
    // options: closeChatOptionsSchema.optional(),
  }),

)

export type CloseChatBlock = z.infer<typeof closeChatBlockSchema>
