import { VariableStore } from '@typebot.io/forge/types'
import { ChatCompletionOptions } from './parseChatCompletionOptions'
import { APICallError, streamText, ToolCallPart, ToolResultPart } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { maxToolCalls } from '../constants'
import { isModelCompatibleWithVision } from '../helpers/isModelCompatibleWithVision'
import { parseChatCompletionMessages } from '@typebot.io/ai/parseChatCompletionMessages'
import { parseTools } from '@typebot.io/ai/parseTools'

type Props = {
  credentials: { apiKey?: string }
  options: ChatCompletionOptions
  variables: VariableStore
  config: { baseUrl: string; defaultModel?: string }
  compatibility?: 'strict' | 'compatible'
  toolResults?: ToolResultPart[]
  toolCalls?: ToolCallPart[]
}

export const runOpenAIChatCompletionStream = async ({
  credentials: { apiKey },
  options,
  variables,
  config: openAIConfig,
  compatibility,
  toolResults,
  toolCalls,
}: Props): Promise<{
  stream?: ReadableStream<any>
  httpError?: { status: number; message: string }
}> => {
  if (!apiKey) return { httpError: { status: 401, message: 'API key missing' } }
  const modelName = options.model?.trim() ?? openAIConfig.defaultModel
  if (!modelName)
    return { httpError: { status: 400, message: 'model not found' } }

  const model = createOpenAI({
    baseURL: openAIConfig.baseUrl ?? options.baseUrl,
    headers: options.baseUrl
      ? {
          'api-key': apiKey,
        }
      : undefined,
    apiKey,
    compatibility,
  })(modelName)

  try {
    const response = await streamText({
      model,
      temperature: options.temperature
        ? Number(options.temperature)
        : undefined,
      messages: await parseChatCompletionMessages({
        messages: options.messages,
        isVisionEnabled: isModelCompatibleWithVision(modelName),
        shouldDownloadImages: false,
        variables,
        toolCalls,
        toolResults,
      }),
      tools: parseTools({ tools: options.tools, variables }),
    })

    let totalToolCalls = 0

    return {
      stream: new ReadableStream({
        async start(controller) {
          const reader = response.toAIStream().getReader()

          async function pump(reader: ReadableStreamDefaultReader<Uint8Array>) {
            const { done, value } = await reader.read()

            if (done) {
              toolCalls = (await response.toolCalls) as ToolCallPart[]
              toolResults = (await response.toolResults) as
                | ToolResultPart[]
                | undefined
              return
            }

            controller.enqueue(value)
            return pump(reader)
          }

          await pump(reader)

          if (
            toolCalls &&
            toolCalls.length > 0 &&
            totalToolCalls < maxToolCalls
          ) {
            totalToolCalls += 1
            const streamResponse = await runOpenAIChatCompletionStream({
              credentials: { apiKey },
              options,
              variables,
              config: openAIConfig,
              compatibility,
              toolCalls,
              toolResults,
            })
            if (!streamResponse.stream)
              throw new APICallError({
                message: streamResponse.httpError?.message ?? 'Unknown error',
                statusCode: streamResponse.httpError?.status,
                url: '',
                requestBodyValues: {},
              })
            await pump(streamResponse.stream.getReader())
          }

          controller.close()
        },
      }),
    }
  } catch (err) {
    if (err instanceof APICallError) {
      return {
        httpError: { status: err.statusCode ?? 500, message: err.message },
      }
    }
    return {
      httpError: {
        status: 500,
        message: 'An unknown error occured while generating the response',
      },
    }
  }
}
