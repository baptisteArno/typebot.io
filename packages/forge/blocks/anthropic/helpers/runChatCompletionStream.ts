import { createAnthropic } from '@ai-sdk/anthropic'
import { defaultAnthropicOptions, maxToolCalls } from '../constants'
import { APICallError, streamText, ToolCallPart, ToolResultPart } from 'ai'
import { isModelCompatibleWithVision } from './isModelCompatibleWithVision'
import { VariableStore } from '@typebot.io/forge'
import { ChatCompletionOptions } from '@typebot.io/openai-block/shared/parseChatCompletionOptions'
import { parseChatCompletionMessages } from '@typebot.io/ai/parseChatCompletionMessages'
import { parseTools } from '@typebot.io/ai/parseTools'

type Props = {
  credentials: { apiKey?: string }
  options: {
    model?: string
    temperature?: ChatCompletionOptions['temperature']
    messages?: ChatCompletionOptions['messages']
    tools?: ChatCompletionOptions['tools']
  }
  variables: VariableStore
  toolResults?: ToolResultPart[]
  toolCalls?: ToolCallPart[]
}

export const runChatCompletionStream = async ({
  credentials: { apiKey },
  options,
  variables,
  toolCalls,
  toolResults,
}: Props): Promise<{
  stream?: ReadableStream<any>
  httpError?: { status: number; message: string }
}> => {
  if (!apiKey) return { httpError: { status: 401, message: 'API key missing' } }
  const modelName = options.model?.trim() ?? defaultAnthropicOptions.model
  if (!modelName)
    return { httpError: { status: 400, message: 'model not found' } }

  const model = createAnthropic({
    apiKey,
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
            const streamResponse = await runChatCompletionStream({
              credentials: { apiKey },
              options,
              variables,
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
        message: 'An error occured while generating the stream',
      },
    }
  }
}
