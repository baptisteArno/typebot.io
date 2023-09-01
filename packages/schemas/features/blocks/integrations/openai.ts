import { z } from 'zod'
import { variableStringSchema } from '../../utils'
import { blockBaseSchema, credentialsBaseSchema } from '../baseSchemas'
import { IntegrationBlockType } from './enums'

export const openAITasks = ['Create chat completion', 'Create image'] as const

export const chatCompletionMessageRoles = [
  'system',
  'user',
  'assistant',
] as const

export const chatCompletionMessageCustomRoles = [
  'Messages sequence ✨',
] as const

export const chatCompletionResponseValues = [
  'Message content',
  'Total tokens',
] as const

export const defaultBaseUrl = 'https://api.openai.com/v1'

const openAIBaseOptionsSchema = z.object({
  credentialsId: z.string().optional(),
  baseUrl: z.string().default(defaultBaseUrl),
  apiVersion: z.string().optional(),
})

const initialOptionsSchema = z
  .object({
    task: z.undefined(),
  })
  .merge(openAIBaseOptionsSchema)

export const chatCompletionMessageSchema = z.object({
  id: z.string(),
  role: z.enum(chatCompletionMessageRoles).optional(),
  content: z.string().optional(),
  name: z.string().optional(),
})

const chatCompletionCustomMessageSchema = z.object({
  id: z.string(),
  role: z.enum(chatCompletionMessageCustomRoles),
  content: z
    .object({
      assistantMessagesVariableId: z.string().optional(),
      userMessagesVariableId: z.string().optional(),
    })
    .optional(),
})

const chatCompletionOptionsSchema = z
  .object({
    task: z.literal(openAITasks[0]),
    model: z.string(),
    messages: z.array(
      z.union([chatCompletionMessageSchema, chatCompletionCustomMessageSchema])
    ),
    advancedSettings: z
      .object({
        temperature: z.number().or(variableStringSchema).optional(),
      })
      .optional(),
    responseMapping: z.array(
      z.object({
        id: z.string(),
        valueToExtract: z.preprocess(
          (val) => (!val ? 'Message content' : val),
          z.enum(chatCompletionResponseValues)
        ),
        variableId: z.string().optional(),
      })
    ),
  })
  .merge(openAIBaseOptionsSchema)

const createImageOptionsSchema = z
  .object({
    task: z.literal(openAITasks[1]),
    prompt: z.string().optional(),
    advancedOptions: z.object({
      size: z.enum(['256x256', '512x512', '1024x1024']).optional(),
    }),
    responseMapping: z.array(
      z.object({
        id: z.string(),
        valueToExtract: z.enum(['Image URL']),
        variableId: z.string().optional(),
      })
    ),
  })
  .merge(openAIBaseOptionsSchema)

export const openAIBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([IntegrationBlockType.OPEN_AI]),
    options: z.discriminatedUnion('task', [
      initialOptionsSchema,
      chatCompletionOptionsSchema,
      createImageOptionsSchema,
    ]),
  })
)

export const openAICredentialsSchema = z
  .object({
    type: z.literal('openai'),
    data: z.object({
      apiKey: z.string(),
    }),
  })
  .merge(credentialsBaseSchema)

export const defaultChatCompletionOptions = (
  createId: () => string
): ChatCompletionOpenAIOptions => ({
  baseUrl: defaultBaseUrl,
  task: 'Create chat completion',
  messages: [
    {
      id: createId(),
    },
  ],
  responseMapping: [
    {
      id: createId(),
      valueToExtract: 'Message content',
    },
  ],
  model: 'gpt-3.5-turbo',
})

export type OpenAICredentials = z.infer<typeof openAICredentialsSchema>
export type OpenAIBlock = z.infer<typeof openAIBlockSchema>
export type ChatCompletionOpenAIOptions = z.infer<
  typeof chatCompletionOptionsSchema
>
export type CreateImageOpenAIOptions = z.infer<typeof createImageOptionsSchema>
