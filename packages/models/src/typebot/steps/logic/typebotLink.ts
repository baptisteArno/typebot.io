import { z } from 'zod'
import { LogicStepType, stepBaseSchema } from '../shared'

export const typebotLinkOptionsSchema = z.object({
  typebotId: z.string().optional(),
  blockId: z.string().optional(),
})

export const typebotLinkStepSchema = stepBaseSchema.and(
  z.object({
    type: z.enum([LogicStepType.TYPEBOT_LINK]),
    options: typebotLinkOptionsSchema,
  })
)

export const defaultTypebotLinkOptions: TypebotLinkOptions = {}

export type TypebotLinkStep = z.infer<typeof typebotLinkStepSchema>
export type TypebotLinkOptions = z.infer<typeof typebotLinkOptionsSchema>
