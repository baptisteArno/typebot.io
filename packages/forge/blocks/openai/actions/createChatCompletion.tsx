import { option, createAction } from '@typebot.io/forge'
import OpenAI, { ClientOptions } from 'openai'
import { defaultOpenAIOptions } from '../constants'
import { OpenAIStream } from 'ai'
import { parseChatCompletionMessages } from '../helpers/parseChatCompletionMessages'
import { parseFunctions } from '../helpers/parseFunctions'
import { isDefined } from '@typebot.io/lib'
import { auth } from '../auth'
import { baseOptions } from '../baseOptions'
import vm from 'vm'

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

const parameterTypeSchema = option.enum(['string', 'number'])

const parameterSchema = option.object({
  name: option.string.layout({
    label: 'Name',
    placeholder: 'parameter name',
  }),
  type: parameterTypeSchema.layout({ label: 'Type' }),
  description: option.string.layout({
    label: 'Description',
    placeholder: 'what this parameter represents',
  }),
  required: option.boolean.layout({ label: 'Required?' }),
})

const functionSchema = option.object({
  name: option.string.layout({
    label: 'Function name',
    placeholder: 'doSomething',
  }),
  description: option.string.layout({
    label: 'Description',
    placeholder: 'What this function does',
  }),
  parameters: option.array(parameterSchema).layout({ accordion: 'Parameters' }),
  code: option.string.layout({
    label: 'Code',
    inputType: 'textarea',
    placeholder: 'code',
  }),
})

export const options = option.object({
  model: option.string.layout({
    placeholder: 'Select a model',
    defaultValue: defaultOpenAIOptions.model,
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
  functions: option
    .array(functionSchema)
    .layout({ accordion: 'Functions', itemLabel: 'function', isOrdered: true }),
  temperature: option.number.layout({
    accordion: 'Advanced settings',
    label: 'Temperature',
    direction: 'row',
    defaultValue: defaultOpenAIOptions.temperature,
  }),
  responseMapping: option
    .saveResponseArray(['Message content', 'Total tokens'])
    .layout({
      accordion: 'Save response',
    }),
})

export const createChatCompletion = createAction({
  name: 'Create chat completion',
  auth,
  baseOptions,
  options,
  getSetVariableIds: (options) =>
    options.responseMapping?.map((res) => res.variableId).filter(isDefined) ??
    [],
  fetchers: [
    {
      id: 'fetchModels',
      dependencies: ['baseUrl', 'apiVersion'],
      fetch: async ({ credentials, options }) => {
        const baseUrl = options?.baseUrl ?? defaultOpenAIOptions.baseUrl
        const config = {
          apiKey: credentials.apiKey,
          baseURL: baseUrl ?? defaultOpenAIOptions.baseUrl,
          defaultHeaders: {
            'api-key': credentials.apiKey,
          },
          defaultQuery: options?.apiVersion
            ? {
                'api-version': options.apiVersion,
              }
            : undefined,
        } satisfies ClientOptions

        const openai = new OpenAI(config)

        const models = await openai.models.list()

        return (
          models.data
            .filter((model) => model.id.includes('gpt'))
            .sort((a, b) => b.created - a.created)
            .map((model) => model.id) ?? []
        )
      },
    },
  ],
  run: {
    server: async ({ credentials: { apiKey }, options, variables }) => {
      const config = {
        apiKey,
        baseURL: options.baseUrl,
        defaultHeaders: {
          'api-key': apiKey,
        },
        defaultQuery: options.apiVersion
          ? {
              'api-version': options.apiVersion,
            }
          : undefined,
      } satisfies ClientOptions

      const openai = new OpenAI(config)

      const messages = parseChatCompletionMessages({ options, variables })

      const body: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming =
        {
          model: options.model ?? defaultOpenAIOptions.model,
          temperature: options.temperature
            ? Number(options.temperature)
            : undefined,
          messages,
          ...(options.functions?.length
            ? {
                tools: parseFunctions({ options, variables }),
                tool_choice: 'auto',
              }
            : {}),
        }

      const response = await (async () => {
        while (true) {
          const response = await openai.chat.completions.create(body)

          if (!response.choices[0].message.tool_calls) {
            return response
          }

          messages.push(response.choices[0].message)

          for (const tool of response.choices[0].message.tool_calls) {
            const toolName = tool.function.name
            const toolArguments = Object.entries(
              JSON.parse(tool.function.arguments)
            )
              .map(([key, value]) => `let ${key} = ${value};`)
              .join('\n')
            const toolCallId = tool.id
            const toolCode = `${toolArguments}\n${
              options.functions?.find((func) => func.name === toolName)?.code
            }`

            const context = {
              require: () => {
                // For safety
                throw new Error('require is not allowed')
              },
            }

            let toolResponse = ''
            try {
              toolResponse = vm.runInNewContext(toolCode, context)
            } catch (e) {
              toolResponse = `${e}`
            }

            messages.push({
              role: 'tool',
              tool_call_id: toolCallId,
              // name: toolName,
              content: toolResponse.toString(),
            })
          }
        }
      })()

      options.responseMapping?.forEach((mapping) => {
        if (!mapping.variableId) return
        if (!mapping.item || mapping.item === 'Message content')
          variables.set(mapping.variableId, response.choices[0].message.content)
        if (mapping.item === 'Total tokens')
          variables.set(mapping.variableId, response.usage?.total_tokens)
      })
    },
    stream: {
      getStreamVariableId: (options) =>
        options.responseMapping?.find(
          (res) => res.item === 'Message content' || !res.item
        )?.variableId,
      run: async ({ credentials: { apiKey }, options, variables }) => {
        const config = {
          apiKey,
          baseURL: options.baseUrl,
          defaultHeaders: {
            'api-key': apiKey,
          },
          defaultQuery: options.apiVersion
            ? {
                'api-version': options.apiVersion,
              }
            : undefined,
        } satisfies ClientOptions

        const openai = new OpenAI(config)

        const response = await openai.chat.completions.create({
          model: options.model ?? defaultOpenAIOptions.model,
          temperature: options.temperature
            ? Number(options.temperature)
            : undefined,
          stream: true,
          messages: parseChatCompletionMessages({ options, variables }),
          tools: parseFunctions({ options, variables }),
          tool_choice: 'auto',
        })

        return OpenAIStream(response)
      },
    },
  },
})
