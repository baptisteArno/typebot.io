import { option, createAction } from '@typebot.io/forge'
import OpenAI, { ClientOptions } from 'openai'
import { defaultOpenAIOptions, maxToolCalls } from '../constants'
import { OpenAIStream, ToolCallPayload } from 'ai'
import { parseChatCompletionMessages } from '../helpers/parseChatCompletionMessages'
import { isDefined } from '@typebot.io/lib'
import { auth } from '../auth'
import { baseOptions } from '../baseOptions'
import {
  ChatCompletionMessage,
  ChatCompletionTool,
} from 'openai/resources/chat/completions'
import { parseToolParameters } from '../helpers/parseToolParameters'
import { executeFunction } from '@typebot.io/variables/executeFunction'

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

const parameterBase = {
  name: option.string.layout({
    label: 'Name',
    placeholder: 'myVariable',
    withVariableButton: false,
  }),
  description: option.string.layout({
    label: 'Description',
    withVariableButton: false,
  }),
  required: option.boolean.layout({
    label: 'Is required?',
  }),
}

export const toolParametersSchema = option
  .array(
    option.discriminatedUnion('type', [
      option
        .object({
          type: option.literal('string'),
        })
        .extend(parameterBase),
      option
        .object({
          type: option.literal('number'),
        })
        .extend(parameterBase),
      option
        .object({
          type: option.literal('boolean'),
        })
        .extend(parameterBase),
      option
        .object({
          type: option.literal('enum'),
          values: option
            .array(option.string)
            .layout({ itemLabel: 'possible value' }),
        })
        .extend(parameterBase),
    ])
  )
  .layout({
    accordion: 'Parameters',
    itemLabel: 'parameter',
  })

const functionToolItemSchema = option.object({
  type: option.literal('function'),
  name: option.string.layout({
    label: 'Name',
    placeholder: 'myFunctionName',
    withVariableButton: false,
  }),
  description: option.string.layout({
    label: 'Description',
    placeholder: 'A brief description of what this function does.',
    withVariableButton: false,
  }),
  parameters: toolParametersSchema,
  code: option.string.layout({
    inputType: 'code',
    label: 'Code',
    lang: 'javascript',
    moreInfoTooltip:
      'A javascript code snippet that can use the defined parameters. It should return a value.',
    withVariableButton: false,
  }),
})

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
  tools: option
    .array(option.discriminatedUnion('type', [functionToolItemSchema]))
    .layout({ accordion: 'Tools', itemLabel: 'tool' }),
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

      const tools = options.tools
        ?.filter((t) => t.name && t.parameters)
        .map((t) => ({
          type: 'function',
          function: {
            name: t.name as string,
            description: t.description,
            parameters: parseToolParameters(t.parameters!),
          },
        })) satisfies ChatCompletionTool[] | undefined

      const messages = parseChatCompletionMessages({ options, variables })

      const body = {
        model: options.model ?? defaultOpenAIOptions.model,
        temperature: options.temperature
          ? Number(options.temperature)
          : undefined,
        messages,
        tools,
      }

      let totalTokens = 0
      let message: ChatCompletionMessage

      for (let i = 0; i < maxToolCalls; i++) {
        const response = await openai.chat.completions.create(body)

        message = response.choices[0].message
        totalTokens += response.usage?.total_tokens || 0

        if (!message.tool_calls) break

        messages.push(message)

        for (const toolCall of message.tool_calls) {
          const name = toolCall.function?.name
          if (!name) continue
          const toolDefinition = options.tools?.find((t) => t.name === name)
          if (!toolDefinition?.code || !toolDefinition.parameters) {
            messages.push({
              tool_call_id: toolCall.id,
              role: 'tool',
              content: 'Function not found',
            })
            continue
          }
          const toolParams = Object.fromEntries(
            toolDefinition.parameters.map(({ name }) => [name, null])
          )
          const toolArgs = toolCall.function?.arguments
            ? JSON.parse(toolCall.function?.arguments)
            : undefined
          if (!toolArgs) continue
          const { output, newVariables } = await executeFunction({
            variables: variables.list(),
            args: { ...toolParams, ...toolArgs },
            body: toolDefinition.code,
          })
          newVariables?.forEach((v) => variables.set(v.id, v.value))

          messages.push({
            tool_call_id: toolCall.id,
            role: 'tool',
            content: output,
          })
        }
      }

      options.responseMapping?.forEach((mapping) => {
        if (!mapping.variableId) return
        if (!mapping.item || mapping.item === 'Message content')
          variables.set(mapping.variableId, message.content)
        if (mapping.item === 'Total tokens')
          variables.set(mapping.variableId, totalTokens)
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

        const tools = options.tools
          ?.filter((t) => t.name && t.parameters)
          .map((t) => ({
            type: 'function',
            function: {
              name: t.name as string,
              description: t.description,
              parameters: parseToolParameters(t.parameters!),
            },
          })) satisfies ChatCompletionTool[] | undefined

        const messages = parseChatCompletionMessages({ options, variables })

        const response = await openai.chat.completions.create({
          model: options.model ?? defaultOpenAIOptions.model,
          temperature: options.temperature
            ? Number(options.temperature)
            : undefined,
          stream: true,
          messages,
          tools,
        })

        return OpenAIStream(response, {
          experimental_onToolCall: async (
            call: ToolCallPayload,
            appendToolCallMessage
          ) => {
            for (const toolCall of call.tools) {
              const name = toolCall.func?.name
              if (!name) continue
              const toolDefinition = options.tools?.find((t) => t.name === name)
              if (!toolDefinition?.code || !toolDefinition.parameters) {
                messages.push({
                  tool_call_id: toolCall.id,
                  role: 'tool',
                  content: 'Function not found',
                })
                continue
              }

              const { output } = await executeFunction({
                variables: variables.list(),
                args:
                  typeof toolCall.func.arguments === 'string'
                    ? JSON.parse(toolCall.func.arguments)
                    : toolCall.func.arguments,
                body: toolDefinition.code,
              })

              // TO-DO: enable once we're out of edge runtime.
              // newVariables?.forEach((v) => variables.set(v.id, v.value))

              const newMessages = appendToolCallMessage({
                tool_call_id: toolCall.id,
                function_name: toolCall.func.name,
                tool_call_result: output,
              })

              return openai.chat.completions.create({
                messages: [
                  ...messages,
                  ...newMessages,
                ] as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
                model: options.model ?? defaultOpenAIOptions.model,
                stream: true,
                tools,
              })
            }
          },
        })
      },
    },
  },
})
