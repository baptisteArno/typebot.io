import OpenAI, { ClientOptions } from 'openai'
import { parseToolParameters } from '../helpers/parseToolParameters'
import { executeFunction } from '@typebot.io/variables/executeFunction'
import { ChatCompletionTool, ChatCompletionMessage } from 'openai/resources'
import { maxToolCalls } from '../constants'
import { parseChatCompletionMessages } from '../helpers/parseChatCompletionMessages'
import { ChatCompletionOptions } from './parseChatCompletionOptions'
import { LogsStore, VariableStore } from '@typebot.io/forge/types'

type OpenAIConfig = {
  baseUrl: string
  defaultModel?: string
}

type Props = {
  credentials: {
    apiKey?: string
  }
  options: ChatCompletionOptions
  variables: VariableStore
  logs: LogsStore
  config: OpenAIConfig
}

export const runChatCompletion = async ({
  credentials: { apiKey },
  options,
  variables,
  config: openAIConfig,
  logs,
}: Props) => {
  const model = options.model?.trim() ?? openAIConfig.defaultModel
  if (!model) return logs.add('No model provided')
  const config = {
    apiKey,
    baseURL: openAIConfig.baseUrl ?? options.baseUrl,
    defaultHeaders: options.baseUrl
      ? {
          'api-key': apiKey,
        }
      : undefined,
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
    model,
    temperature: options.temperature ? Number(options.temperature) : undefined,
    messages,
    tools: (tools?.length ?? 0) > 0 ? tools : undefined,
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
}
