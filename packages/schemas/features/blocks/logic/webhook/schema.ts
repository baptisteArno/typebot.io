import { z } from '../../../../zod'
import { blockBaseSchema } from '../../shared'
import { LogicBlockType } from '../constants'

export const webhookOptionsSchema = z.object({
  responseVariableMapping: z
    .array(
      z.object({
        id: z.string(),
        variableId: z.string().optional(),
        bodyPath: z.string().optional(),
      })
    )
    .optional(),
  // Which variable to store the caller-supplied external ID into, when this
  // block is used as a start-or-resume trigger (see the "external" callback
  // URL). Unused on the resultId-based resume-only URL.
  externalIdVariableId: z.string().optional(),
})

export const webhookBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.WEBHOOK]),
    options: webhookOptionsSchema.optional(),
  })
)

export type WebhookBlock = z.infer<typeof webhookBlockSchema>
