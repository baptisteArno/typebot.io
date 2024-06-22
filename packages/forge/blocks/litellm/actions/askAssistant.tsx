import {
  LogsStore,
  VariableStore,
  createAction,
  option,
} from '@typebot.io/forge'
import { isDefined, isEmpty, isNotEmpty } from '@typebot.io/lib'
import { auth } from '../auth'
import { ClientOptions, OpenAI } from 'openai'
import { executeFunction } from '@typebot.io/variables/executeFunction'
import { readDataStream } from 'ai'
import { OpenAIAssistantStream } from '../helpers/OpenAIAssistantStream'
import { isModelCompatibleWithVision } from '../helpers/isModelCompatibleWithVision'
import { splitUserTextMessageIntoBlocks } from '../helpers/splitUserTextMessageIntoBlocks'
import { deprecatedAskAssistantOptions } from '../deprecated'

export const askAssistant = createAction({
  auth,
  name: 'Ask Assistant',
  options: option
    .object({
      assistantId: option.string.layout({
        label: 'Assistant ID',
        placeholder: 'Select an assistant',
        moreInfoTooltip: 'The OpenAI assistant you want to ask question to.',
        fetcher: 'fetchAssistants',
      }),
      threadVariableId: option.string.layout({
        label: 'Thread ID',
        moreInfoTooltip:
          'Used to remember the conversation with the user. If empty, a new thread is created.',
        inputType: 'variableDropdown',
      }),

      message: option.string.layout({
        label: 'Message',
        inputType: 'textarea',
      }),
      functions: option
        .array(
          option.object({
            name: option.string.layout({
              fetcher: 'fetchAssistantFunctions',
              label: 'Name',
            }),
            code: option.string.layout({
              inputType: 'code',
              label: 'Code',
              lang: 'javascript',
              moreInfoTooltip:
                'A javascript code snippet that can use the defined parameters. It should return a value.',
              withVariableButton: false,
            }),
          })
        )
        .layout({ accordion: 'Functions', itemLabel: 'function' }),
      responseMapping: option
        .saveResponseArray(['Message', 'Thread ID'] as const, {
          item: { hiddenItems: ['Thread ID'] },
        })
        .layout({
          accordion: 'Save response',
        }),
    })
    .merge(deprecatedAskAssistantOptions),
  fetchers: [
    {
      id: 'fetchAssistants',
      fetch: async ({ options, credentials }) => {
        if (!credentials?.apiKey) return []

        const config = {
          apiKey: credentials.apiKey,
          baseURL: credentials.baseURL,
          defaultHeaders: {
            'api-key': credentials.apiKey,
          },
          defaultQuery: {
            'api-version': credentials.apiVersion,
          },
        } satisfies ClientOptions

        const openai = new OpenAI(config)

        const response = await openai.beta.assistants.list({
          limit: 100,
        })

        return response.data
          .map((assistant) =>
            assistant.name
              ? {
                label: assistant.name,
                value: assistant.id,
              }
              : undefined
          )
          .filter(isDefined)
      },
      dependencies: [],
    },
    {
      id: 'fetchAssistantFunctions',
      fetch: async ({ options, credentials }) => {
        if (!options.assistantId || !credentials?.apiKey) return []

        const config = {
          apiKey: credentials.apiKey,
          baseURL: credentials.baseURL,
          defaultHeaders: {
            'api-key': credentials.apiKey,
          },
          defaultQuery: {
            'api-version': credentials.apiVersion,
          },
        } satisfies ClientOptions

        const openai = new OpenAI(config)

        const response = await openai.beta.assistants.retrieve(
          options.assistantId
        )

        return response.tools
          .filter((tool) => tool.type === 'function')
          .map((tool) =>
            tool.type === 'function' && tool.function.name
              ? tool.function.name
              : undefined
          )
          .filter(isDefined)
      },
      dependencies: ['assistantId'],
    },
  ],
  getSetVariableIds: ({ responseMapping }) =>
    responseMapping?.map((r) => r.variableId).filter(isDefined) ?? [],
  run: {
    stream: {
      getStreamVariableId: ({ responseMapping }) =>
        responseMapping?.find((m) => !m.item || m.item === 'Message')
          ?.variableId,
      run: async ({ credentials, options, variables }) => ({
        stream: await createAssistantStream({
          apiKey: credentials.apiKey,
          assistantId: options.assistantId,
          message: options.message,
          baseURL: credentials.baseURL,
          apiVersion: credentials.apiVersion,
          threadVariableId: options.threadVariableId,
          variables,
          functions: options.functions,
          responseMapping: options.responseMapping,
        }),
      }),
    },
    server: async ({
      credentials: { apiKey, baseURL, apiVersion },
      options: {
        assistantId,
        message,
        responseMapping,
        threadId,
        threadVariableId,
        functions,
      },
      variables,
      logs,
    }) => {
      const stream = await createAssistantStream({
        apiKey,
        assistantId,
        message,
        baseURL,
        apiVersion,
        threadVariableId,
        threadId,
        logs,
        variables,
        functions,
      })

      if (!stream) return

      let writingMessage = ''

      for await (const { type, value } of readDataStream(stream.getReader())) {
        if (type === 'text') {
          writingMessage += value
        }
      }

      responseMapping?.forEach((mapping) => {
        if (!mapping.variableId) return
        if (!mapping.item || mapping.item === 'Message') {
          variables.set(
            mapping.variableId,
            writingMessage.replace(/【.+】/g, '')
          )
        }
      })
    },
  },
})

const createAssistantStream = async ({
  apiKey,
  assistantId,
  logs,
  message,
  baseURL,
  apiVersion,
  threadVariableId,
  variables,
  threadId,
  functions,
  responseMapping,
}: {
  apiKey?: string
  assistantId?: string
  message?: string
  baseURL?: string
  apiVersion?: string
  threadVariableId?: string
  threadId?: string
  functions?: { name?: string; code?: string }[]
  responseMapping?: {
    item?: 'Thread ID' | 'Message' | undefined
    variableId?: string | undefined
  }[]
  logs?: LogsStore
  variables: VariableStore
}): Promise<ReadableStream | undefined> => {
  if (isEmpty(assistantId)) {
    logs?.add('Assistant ID is empty')
    return
  }
  if (isEmpty(message)) {
    logs?.add('Message is empty')
    return
  }
  const config = {
    apiKey,
    baseURL,
    defaultHeaders: {
      'api-key': apiKey,
    },
    defaultQuery: {
      'api-version': apiVersion,
    },
  } satisfies ClientOptions

  const openai = new OpenAI(config)

  let currentThreadId: string | undefined

  if (
    threadVariableId &&
    isNotEmpty(variables.get(threadVariableId)?.toString())
  ) {
    currentThreadId = variables.get(threadVariableId)?.toString()
  } else if (isNotEmpty(threadId)) {
    currentThreadId = threadId
  } else {
    currentThreadId = (await openai.beta.threads.create({})).id
    const threadIdResponseMapping = responseMapping?.find(
      (mapping) => mapping.item === 'Thread ID'
    )
    if (threadIdResponseMapping?.variableId)
      variables.set(threadIdResponseMapping.variableId, currentThreadId)
    else if (threadVariableId) variables.set(threadVariableId, currentThreadId)
  }

  if (!currentThreadId) {
    logs?.add('Could not get thread ID')
    return
  }

  const assistant = await openai.beta.assistants.retrieve(assistantId)

  // Add a message to the thread
  const createdMessage = await openai.beta.threads.messages.create(
    currentThreadId,
    {
      role: 'user',
      content: isModelCompatibleWithVision(assistant.model)
        ? await splitUserTextMessageIntoBlocks(message)
        : message,
    }
  )
  return OpenAIAssistantStream(
    { threadId: currentThreadId, messageId: createdMessage.id },
    async ({ forwardStream }) => {
      const runStream = openai.beta.threads.runs.createAndStream(
        currentThreadId,
        {
          assistant_id: assistantId,
        }
      )

      let runResult = await forwardStream(runStream)

      while (
        runResult?.status === 'requires_action' &&
        runResult.required_action?.type === 'submit_tool_outputs'
      ) {
        const tool_outputs = (
          await Promise.all(
            runResult.required_action.submit_tool_outputs.tool_calls.map(
              async (toolCall) => {
                const parameters = JSON.parse(toolCall.function.arguments)

                const functionToExecute = functions?.find(
                  (f) => f.name === toolCall.function.name
                )
                if (!functionToExecute) return

                const name = toolCall.function.name
                if (!name || !functionToExecute.code) return

                const { output, newVariables } = await executeFunction({
                  variables: variables.list(),
                  body: functionToExecute.code,
                  args: parameters,
                })

                newVariables?.forEach((variable) => {
                  variables.set(variable.id, variable.value)
                })

                return {
                  tool_call_id: toolCall.id,
                  output,
                }
              }
            )
          )
        ).filter(isDefined)
        runResult = await forwardStream(
          openai.beta.threads.runs.submitToolOutputsStream(
            currentThreadId,
            runResult.id,
            { tool_outputs }
          )
        )
      }
    }
  )
}
