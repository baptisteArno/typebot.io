import { z } from 'zod'
import { blockBaseSchema, IntegrationBlockType } from '../shared'

export const chatwootOptionsSchema = z.object({
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

export const chatwootBlockSchema = blockBaseSchema.and(
  z.object({
    type: z.enum([IntegrationBlockType.CHATWOOT]),
    options: chatwootOptionsSchema,
  })
)

export const defaultChatwootOptions: ChatwootOptions = {
  baseUrl: 'https://app.chatwoot.com',
  websiteToken: '',
}

export type ChatwootBlock = z.infer<typeof chatwootBlockSchema>
export type ChatwootOptions = z.infer<typeof chatwootOptionsSchema>
