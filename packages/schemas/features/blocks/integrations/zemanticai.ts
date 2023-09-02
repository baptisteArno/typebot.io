import { z } from 'zod'
import { blockBaseSchema, credentialsBaseSchema } from '../baseSchemas'
import { IntegrationBlockType } from './enums'

export const zemanticAIOptionsSchema = z.object({
  credentialsId: z.string().optional(),
  resultsVariable: z.string().optional(),
  summaryVariable: z.string().optional(),
  projectId: z.string().optional(),
  systemPrompt: z.string().optional(),
  prompt: z.string().optional(),
  query: z.string().optional(),
  maxResults: z.number().int().optional(),
})

export const zemanticAIBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([IntegrationBlockType.ZEMANTIC_AI]),
    options: zemanticAIOptionsSchema,
  })
)

export const zematicAICredentialsSchema = z
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

export type ZemanticAIResponse = z.infer<typeof zemanticSearchResponseSchema>
export type ZemanticAICredentials = z.infer<typeof zematicAICredentialsSchema>
export type ZemanticAIOptions = z.infer<typeof zemanticAIOptionsSchema>
export type ZemanticAIBlock = z.infer<typeof zemanticAIBlockSchema>
