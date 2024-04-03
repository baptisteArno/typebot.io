import { option, createAction } from '@typebot.io/forge'
import { isDefined } from '@typebot.io/lib'
import { auth } from '../auth'
import { parseMessages } from '../helpers/parseMessages'
import { OpenAIStream } from 'ai'

const nativeMessageContentSchema = {
  content: option.string.layout({
    inputType: 'textarea',
    placeholder: 'Content',
  }),
}

const systemMessageItemSchema = option
  .object({
    role: option.literal('system'),
  })
  .extend(nativeMessageContentSchema)

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
  model: option.string.layout({
    placeholder: 'Select a model',
    fetcher: 'fetchModels',
  }),
  messages: option
    .array(
      option.discriminatedUnion('role', [
        systemMessageItemSchema,
        userMessageItemSchema,
        assistantMessageItemSchema,
        dialogueMessageItemSchema,
      ])
    )
    .layout({ accordion: 'Messages', itemLabel: 'message', isOrdered: true }),
  responseMapping: option.saveResponseArray(['Message content']).layout({
    accordion: 'Save response',
  }),
})

export const createChatCompletion = createAction({
  name: 'Create chat completion',
  auth,
  options,
  turnableInto: [
    {
      blockId: 'openai',
    },
    {
      blockId: 'together-ai',
    },
    { blockId: 'open-router' },
    {
      blockId: 'anthropic',
      transform: (options) => ({
        ...options,
        action: 'Create Chat Message',
        responseMapping: options.responseMapping?.map((res: any) =>
          res.item === 'Message content'
            ? { ...res, item: 'Message Content' }
            : res
        ),
      }),
    },
  ],
  getSetVariableIds: (options) =>
    options.responseMapping?.map((res) => res.variableId).filter(isDefined) ??
    [],
  fetchers: [
    {
      id: 'fetchModels',
      dependencies: [],
      fetch: async ({ credentials }) => {
        const MistralClient = (await import('@mistralai/mistralai')).default
        const client = new MistralClient(credentials.apiKey)

        const listModelsResponse = await client.listModels()

        return (
          listModelsResponse.data
            .sort((a, b) => b.created - a.created)
            .map((model) => model.id) ?? []
        )
      },
    },
  ],
  run: {
    server: async ({ credentials: { apiKey }, options, variables, logs }) => {
      if (!options.model) return logs.add('No model selected')
      const MistralClient = (await import('@mistralai/mistralai')).default
      const client = new MistralClient(apiKey)

      const response = await client.chat({
        model: options.model,
        messages: parseMessages({ options, variables }),
      })

      options.responseMapping?.forEach((mapping) => {
        if (!mapping.variableId) return
        if (!mapping.item || mapping.item === 'Message content')
          variables.set(mapping.variableId, response.choices[0].message.content)
      })
    },
    stream: {
      getStreamVariableId: (options) =>
        options.responseMapping?.find(
          (res) => res.item === 'Message content' || !res.item
        )?.variableId,
      run: async ({ credentials: { apiKey }, options, variables }) => {
        if (!options.model) return
        const MistralClient = (await import('@mistralai/mistralai')).default
        const client = new MistralClient(apiKey)

        const response = client.chatStream({
          model: options.model,
          messages: parseMessages({ options, variables }),
        })

        // @ts-ignore https://github.com/vercel/ai/issues/936
        return OpenAIStream(response)
      },
    },
  },
})
