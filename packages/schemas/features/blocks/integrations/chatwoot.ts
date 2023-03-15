import { z } from 'zod'
import { blockBaseSchema } from '../baseSchemas'
import { IntegrationBlockType } from './enums'

export const chatwootTasks = ['Show widget', 'Close widget'] as const

export const chatwootOptionsSchema = z.object({
  task: z.enum(chatwootTasks).optional(),
  baseUrl: z.string(),
  websiteToken: z.string(),
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
    options: chatwootOptionsSchema,
  })
)

export const defaultChatwootOptions: ChatwootOptions = {
  task: 'Show widget',
  baseUrl: 'https://app.chatwoot.com',
  websiteToken: '',
}

export type ChatwootBlock = z.infer<typeof chatwootBlockSchema>
export type ChatwootOptions = z.infer<typeof chatwootOptionsSchema>
