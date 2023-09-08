import { z } from 'zod'
import { blockBaseSchema, credentialsBaseSchema } from '../baseSchemas'
import { IntegrationBlockType } from './enums'

export const searchResponseValues = ['Summary', 'Results'] as const

export const zemanticAiOptionsSchema = z.object({
  credentialsId: z.string().optional(),
  projectId: z.string().optional(),
  systemPrompt: z.string().optional(),
  prompt: z.string().optional(),
  query: z.string().optional(),
  maxResults: z.number().int().optional(),
  responseMapping: z.array(
    z.object({
      id: z.string(),
      valueToExtract: z.preprocess(
        (val) => (!val ? 'Summary' : val),
        z.enum(searchResponseValues)
      ),
      variableId: z.string().optional(),
    })
  ),
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
    type: z.literal('zemanticAi'),
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

export const zemanticAiDefaultOptions: ZemanticAiOptions = {
  maxResults: 3,
  responseMapping: [],
}

export type ZemanticAiResponse = z.infer<typeof zemanticSearchResponseSchema>
export type ZemanticAiCredentials = z.infer<typeof zemanticAiCredentialsSchema>
export type ZemanticAiOptions = z.infer<typeof zemanticAiOptionsSchema>
export type ZemanticAiBlock = z.infer<typeof zemanticAiBlockSchema>
