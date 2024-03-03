import { LogsStore, ReadOnlyVariableStore } from '@typebot.io/forge/types'
import { ChatCompletionOptions } from './parseChatCompletionOptions'
import { executeFunction } from '@typebot.io/variables/executeFunction'
import { OpenAIStream, ToolCallPayload } from 'ai'
import OpenAI, { ClientOptions } from 'openai'
import { ChatCompletionTool } from 'openai/resources'
import { parseChatCompletionMessages } from '../helpers/parseChatCompletionMessages'
import { parseToolParameters } from '../helpers/parseToolParameters'

type Props = {
  credentials: { apiKey?: string }
  options: ChatCompletionOptions
  variables: ReadOnlyVariableStore
  config: { baseUrl: string; defaultModel?: string }
}
export const runChatCompletionStream = async ({
  credentials: { apiKey },
  options,
  variables,
  config: openAIConfig,
}: Props) => {
  const model = options.model?.trim() ?? openAIConfig.defaultModel
  if (!model) return
  const config = {
    apiKey,
    baseURL: openAIConfig.baseUrl ?? options.baseUrl,
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
    model,
    temperature: options.temperature ? Number(options.temperature) : undefined,
    stream: true,
    messages,
    tools: (tools?.length ?? 0) > 0 ? tools : undefined,
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
          model,
          stream: true,
          tools,
        })
      }
    },
  })
}
