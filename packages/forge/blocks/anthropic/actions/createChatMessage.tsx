import { createAction, option } from '@typebot.io/forge'
import { auth } from '../auth'
import {
  anthropicLegacyModels,
  anthropicModelLabels,
  anthropicModels,
  defaultAnthropicOptions,
  maxToolRoundtrips,
} from '../constants'
import { isDefined } from '@typebot.io/lib'
import { createAnthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { runChatCompletionStream } from '../helpers/runChatCompletionStream'
import { toolsSchema } from '@typebot.io/ai/schemas'
import { parseTools } from '@typebot.io/ai/parseTools'
import { parseChatCompletionMessages } from '@typebot.io/ai/parseChatCompletionMessages'
import { isModelCompatibleWithVision } from '../helpers/isModelCompatibleWithVision'

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
    toLabels: (val) =>
      val
        ? anthropicModelLabels[val as (typeof anthropicModels)[number]]
        : undefined,
    hiddenItems: anthropicLegacyModels,
    placeholder: 'Select a model',
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
  tools: toolsSchema,
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

const transformToChatCompletionOptions = (
  options: any,
  resetModel = false
) => ({
  ...options,
  model: resetModel ? undefined : options.model,
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
      transform: (opts) => transformToChatCompletionOptions(opts, true),
    },
    {
      blockId: 'openai',
      transform: (opts) => transformToChatCompletionOptions(opts, true),
    },
    { blockId: 'open-router', transform: transformToChatCompletionOptions },
    { blockId: 'together-ai', transform: transformToChatCompletionOptions },
  ],
  getSetVariableIds: ({ responseMapping }) =>
    responseMapping?.map((res) => res.variableId).filter(isDefined) ?? [],
  run: {
    server: async ({ credentials: { apiKey }, options, variables, logs }) => {
      const modelName = options.model ?? defaultAnthropicOptions.model
      const model = createAnthropic({
        apiKey,
      })(modelName)

      const { text } = await generateText({
        model,
        temperature: options.temperature
          ? Number(options.temperature)
          : undefined,
        messages: await parseChatCompletionMessages({
          messages: options.messages,
          isVisionEnabled: isModelCompatibleWithVision(modelName),
          shouldDownloadImages: true,
          variables,
        }),
        tools: parseTools({ tools: options.tools, variables }),
        maxToolRoundtrips: maxToolRoundtrips,
      })

      options.responseMapping?.forEach((mapping) => {
        if (!mapping.variableId) return
        if (!mapping.item || mapping.item === 'Message Content')
          variables.set(mapping.variableId, text)
      })
    },
    stream: {
      getStreamVariableId: (options) =>
        options.responseMapping?.find(
          (res) => res.item === 'Message Content' || !res.item
        )?.variableId,
      run: async ({ credentials: { apiKey }, options, variables }) =>
        runChatCompletionStream({
          credentials: { apiKey },
          options,
          variables,
        }),
    },
  },
})
