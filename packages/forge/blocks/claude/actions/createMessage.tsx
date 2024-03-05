import { createAction, option } from '@typebot.io/forge'
import { auth } from '../auth'
import { Anthropic } from '@anthropic-ai/sdk'
import { AnthropicStream } from 'ai'
import { claudeModels, defaultClaudeOptions } from '../constants'
import { parseChatMessages } from '../helpers/parseChatMessages'

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
  role: option.literal('dialogue'),
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
  model: option.enum(claudeModels).layout({
    label: 'Claude Model',
    defaultValue: defaultClaudeOptions.model,
    isRequired: true,
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
    label: 'System Instruction',
    direction: 'row',
  }),
  temperature: option.number.layout({
    accordion: 'Advanced Settings',
    label: 'Temperature',
    direction: 'row',
    defaultValue: defaultClaudeOptions.temperature,
  }),
  maxTokens: option.number.layout({
    accordion: 'Advanced Settings',
    label: 'Max Tokens',
    direction: 'row',
    defaultValue: defaultClaudeOptions.maxTokens,
  }),
  responseMapping: option
    .saveResponseArray(['Message Content'] as const)
    .layout({
      accordion: 'Save Response',
    }),
})

export const createMessage = createAction({
  name: 'Create Message',
  auth,
  options,
  run: {
    server: async ({ credentials: { apiKey }, options, variables }) => {
      const client = new Anthropic({
        apiKey: apiKey,
      })

      const messages = parseChatMessages({ options, variables })

      const reply = await client.messages.create({
        messages,
        model: options.model ?? defaultClaudeOptions.model,
        system: options.systemMessage,
        temperature: options.temperature
          ? Number(options.temperature)
          : undefined,
        max_tokens: Number(options.maxTokens) ?? defaultClaudeOptions.maxTokens,
      })

      messages.push(reply)

      options.responseMapping?.forEach((mapping) => {
        if (!mapping.variableId) return

        if (!mapping.item || mapping.item === 'Message Content')
          variables.set(mapping.variableId, reply.content[0].text)
      })
    },
    stream: {
      getStreamVariableId: (options) =>
        options.responseMapping?.find(
          (res) => res.item === 'Message Content' || !res.item
        )?.variableId,
      run: async ({ credentials: { apiKey }, options, variables }) => {
        const client = new Anthropic({
          apiKey: apiKey,
        })

        const messages = parseChatMessages({ options, variables })

        const response = await client.messages.create({
          messages,
          model: options.model ?? defaultClaudeOptions.model,
          system: options.systemMessage,
          temperature: options.temperature
            ? Number(options.temperature)
            : undefined,
          max_tokens:
            Number(options.maxTokens) ?? defaultClaudeOptions.maxTokens,
          stream: true,
        })

        return AnthropicStream(response)
      },
    },
  },
})
