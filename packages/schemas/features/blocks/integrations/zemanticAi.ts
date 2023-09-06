import { z } from 'zod'
import { blockBaseSchema, credentialsBaseSchema } from '../baseSchemas'
import { IntegrationBlockType } from './enums'

export const zemanticAiOptionsSchema = z.object({
  credentialsId: z.string().optional(),
  resultsVariable: z.string().optional(),
  summaryVariable: z.string().optional(),
  projectId: z.string().optional(),
  systemPrompt: z.string().optional(),
  prompt: z.string().optional(),
  query: z.string().optional(),
  maxResults: z.number().int().optional(),
})

export const zemanticAiBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([IntegrationBlockType.ZEMANTIC_AI]),
    blockId: z.string().optional(),
    options: zemanticAiOptionsSchema,
  })
)

export const zemanticAiCredentialsSchema = z
  .object({
    type: z.literal('zemanticai'),
    data: z.object({
      apiKey: z.string(),
    }),
  })
  .merge(credentialsBaseSchema)

export const zemanticSearchResponseSchema = z.object({
  results: z.array(
    z.object({
      documentId: z.string(),
      text: z.string(),
      score: z.number(),
    })
  ),
  summary: z.string(),
})

export type ZemanticAiResponse = z.infer<typeof zemanticSearchResponseSchema>
export type ZemanticAiCredentials = z.infer<typeof zemanticAiCredentialsSchema>
export type ZemanticAiOptions = z.infer<typeof zemanticAiOptionsSchema>
export type ZemanticAiBlock = z.infer<typeof zemanticAiBlockSchema>
