import { maxToolCalls } from '../constants'
import { ChatCompletionOptions } from './parseChatCompletionOptions'
import { LogsStore, VariableStore } from '@typebot.io/forge/types'
import { createOpenAI } from '@ai-sdk/openai'
import { APICallError, generateText } from 'ai'
import { isModelCompatibleWithVision } from '../helpers/isModelCompatibleWithVision'
import { parseTools } from '@typebot.io/ai/parseTools'
import { parseChatCompletionMessages } from '@typebot.io/ai/parseChatCompletionMessages'

type OpenAIConfig = {
  baseUrl?: string
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
  compatibility?: 'strict' | 'compatible'
}

export const runOpenAIChatCompletion = async ({
  credentials: { apiKey },
  options,
  variables,
  config: openAIConfig,
  logs,
  compatibility,
}: Props) => {
  if (!apiKey) return logs.add('No API key provided')
  const modelName = options.model?.trim() ?? openAIConfig.defaultModel
  if (!modelName) return logs.add('No model provided')

  const model = createOpenAI({
    baseURL: openAIConfig.baseUrl ?? options.baseUrl,
    apiKey,
    compatibility,
  })(modelName)

  try {
    const { text, usage } = await generateText({
      model,
      temperature: options.temperature
        ? Number(options.temperature)
        : undefined,
      messages: await parseChatCompletionMessages({
        messages: options.messages,
        variables,
        isVisionEnabled: isModelCompatibleWithVision(modelName),
        shouldDownloadImages: false,
      }),
      tools: parseTools({ tools: options.tools, variables }),
      maxToolRoundtrips: maxToolCalls,
    })

    options.responseMapping?.forEach((mapping) => {
      if (!mapping.variableId) return
      if (!mapping.item || mapping.item === 'Message content')
        variables.set(mapping.variableId, text)
      if (mapping.item === 'Total tokens')
        variables.set(mapping.variableId, usage.totalTokens)
    })
  } catch (err) {
    if (err instanceof APICallError) {
      logs.add({
        status: 'error',
        description: 'An API call error occured while generating the response',
        details: err.message,
      })
      return
    }
    logs.add({
      status: 'error',
      description: 'An unknown error occured while generating the response',
      details: err,
    })
  }
}
