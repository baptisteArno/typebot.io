import { createAction, option } from '@typebot.io/forge'
import { auth } from '../auth'
import { AnthropicStream } from 'ai'
import { anthropicModels, defaultAnthropicOptions } from '../constants'
import { parseChatMessages } from '../helpers/parseChatMessages'
import { isDefined } from '@typebot.io/lib'

const nativeMessageContentSchema = {
  content: option.string.layout({
    inputType: 'textarea',
    placeholder: 'Content',
  }),
}

const userMessageItemSchema = option
  .object({
    role: option.literal('user'),
  })
  .extend(nativeMessageContentSchema)

const assistantMessageItemSchema = option
  .object({
    role: option.literal('assistant'),
  })
  .extend(nativeMessageContentSchema)

const dialogueMessageItemSchema = option.object({
  role: option.literal('Dialogue'),
  dialogueVariableId: option.string.layout({
    inputType: 'variableDropdown',
    placeholder: 'Dialogue variable',
  }),
  startsBy: option.enum(['user', 'assistant']).layout({
    label: 'starts by',
    direction: 'row',
    defaultValue: 'user',
  }),
})

export const options = option.object({
  model: option.enum(anthropicModels).layout({
    defaultValue: defaultAnthropicOptions.model,
  }),
  messages: option
    .array(
      option.discriminatedUnion('role', [
        userMessageItemSchema,
        assistantMessageItemSchema,
        dialogueMessageItemSchema,
      ])
    )
    .layout({ accordion: 'Messages', itemLabel: 'message', isOrdered: true }),
  systemMessage: option.string.layout({
    accordion: 'Advanced Settings',
    label: 'System prompt',
    direction: 'row',
    inputType: 'textarea',
  }),
  temperature: option.number.layout({
    accordion: 'Advanced Settings',
    label: 'Temperature',
    direction: 'row',
    defaultValue: defaultAnthropicOptions.temperature,
  }),
  maxTokens: option.number.layout({
    accordion: 'Advanced Settings',
    label: 'Max Tokens',
    direction: 'row',
    defaultValue: defaultAnthropicOptions.maxTokens,
  }),
  responseMapping: option
    .saveResponseArray(['Message Content'] as const)
    .layout({
      accordion: 'Save Response',
    }),
})

const transformToChatCompletionOptions = (options: any) => ({
  ...options,
  action: 'Create chat completion',
  responseMapping: options.responseMapping?.map((res: any) =>
    res.item === 'Message Content' ? { ...res, item: 'Message content' } : res
  ),
})

export const createChatMessage = createAction({
  name: 'Create Chat Message',
  auth,
  options,
  turnableInto: [
    {
      blockId: 'mistral',
      transform: transformToChatCompletionOptions,
    },
    {
      blockId: 'openai',
      transform: transformToChatCompletionOptions,
    },
    { blockId: 'open-router', transform: transformToChatCompletionOptions },
    { blockId: 'together-ai', transform: transformToChatCompletionOptions },
  ],
  getSetVariableIds: ({ responseMapping }) =>
    responseMapping?.map((res) => res.variableId).filter(isDefined) ?? [],
  run: {
    server: async ({ credentials: { apiKey }, options, variables, logs }) => {
      const { Anthropic } = await import('@anthropic-ai/sdk')

      const client = new Anthropic({
        apiKey: apiKey,
      })

      const messages = parseChatMessages({ options, variables })

      try {
        const reply = await client.messages.create({
          messages,
          model: options.model ?? defaultAnthropicOptions.model,
          system: options.systemMessage,
          temperature: options.temperature
            ? Number(options.temperature)
            : undefined,
          max_tokens: options.maxTokens
            ? Number(options.maxTokens)
            : defaultAnthropicOptions.maxTokens,
        })

        messages.push(reply)

        options.responseMapping?.forEach((mapping) => {
          if (!mapping.variableId) return

          if (!mapping.item || mapping.item === 'Message Content')
            variables.set(mapping.variableId, reply.content[0].text)
        })
      } catch (error) {
        if (error instanceof Anthropic.APIError) {
          logs.add({
            status: 'error',
            description: `${error.status} ${error.name}`,
            details: error.message,
          })
        } else {
          throw error
        }
      }
    },
    stream: {
      getStreamVariableId: (options) =>
        options.responseMapping?.find(
          (res) => res.item === 'Message Content' || !res.item
        )?.variableId,
      run: async ({ credentials: { apiKey }, options, variables }) => {
        const { Anthropic } = await import('@anthropic-ai/sdk')

        const client = new Anthropic({
          apiKey: apiKey,
        })

        const messages = parseChatMessages({ options, variables })

        const response = await client.messages.create({
          messages,
          model: options.model ?? defaultAnthropicOptions.model,
          system: options.systemMessage,
          temperature: options.temperature
            ? Number(options.temperature)
            : undefined,
          max_tokens: options.maxTokens
            ? Number(options.maxTokens)
            : defaultAnthropicOptions.maxTokens,
          stream: true,
        })

        return AnthropicStream(response)
      },
    },
  },
})
