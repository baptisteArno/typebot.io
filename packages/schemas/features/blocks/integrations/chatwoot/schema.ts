import { z } from '../../../../zod'
import { chatwootTasks } from './constants'
import { blockBaseSchema } from '../../shared'
import { IntegrationBlockType } from '../constants'

export const chatwootOptionsSchema = z.object({
  task: z.enum(chatwootTasks).optional(),
  baseUrl: z.string().optional(),
  websiteToken: z.string().optional(),
  user: z
    .object({
      id: z.string().optional(),
      email: z.string().optional(),
      name: z.string().optional(),
      avatarUrl: z.string().optional(),
      phoneNumber: z.string().optional(),
    })
    .optional(),
})

export const chatwootBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([IntegrationBlockType.CHATWOOT]),
    options: chatwootOptionsSchema.optional(),
  })
)

export type ChatwootBlock = z.infer<typeof chatwootBlockSchema>
