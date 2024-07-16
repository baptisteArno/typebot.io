import { createMistral } from '@ai-sdk/mistral'
import { APICallError, streamText, ToolCallPart, ToolResultPart } from 'ai'
import { VariableStore } from '@typebot.io/forge'
import { ChatCompletionOptions } from '@typebot.io/openai-block/shared/parseChatCompletionOptions'
import { parseChatCompletionMessages } from '@typebot.io/ai/parseChatCompletionMessages'
import { parseTools } from '@typebot.io/ai/parseTools'
import { maxToolRoundtrips } from '../constants'
import { pumpStreamUntilDone } from '@typebot.io/ai/pumpStreamUntilDone'
import { appendToolResultsToMessages } from '@typebot.io/ai/appendToolResultsToMessages'

type Props = {
  credentials: { apiKey?: string }
  options: {
    model?: string
    temperature?: ChatCompletionOptions['temperature']
    messages?: ChatCompletionOptions['messages']
    tools?: ChatCompletionOptions['tools']
  }
  variables: VariableStore
}

export const runChatCompletionStream = async ({
  credentials: { apiKey },
  options,
  variables,
}: Props): Promise<{
  stream?: ReadableStream<any>
  httpError?: { status: number; message: string }
}> => {
  if (!apiKey) return { httpError: { status: 401, message: 'API key missing' } }
  const modelName = options.model?.trim()
  if (!modelName)
    return { httpError: { status: 400, message: 'model not found' } }

  const streamConfig = {
    model: createMistral({
      apiKey,
    })(modelName),
    messages: await parseChatCompletionMessages({
      messages: options.messages,
      isVisionEnabled: false,
      shouldDownloadImages: false,
      variables,
    }),
    temperature: options.temperature ? Number(options.temperature) : undefined,
    tools: parseTools({ tools: options.tools, variables }),
  }

  try {
    const response = await streamText(streamConfig)

    let totalToolCalls = 0
    let toolCalls: ToolCallPart[] = []
    let toolResults: ToolResultPart[] = []

    return {
      stream: new ReadableStream({
        async start(controller) {
          const reader = response.toAIStream().getReader()

          await pumpStreamUntilDone(controller, reader)

          toolCalls = await response.toolCalls
          if (toolCalls.length > 0)
            toolResults = (await response.toolResults) as ToolResultPart[]

          while (
            toolCalls &&
            toolCalls.length > 0 &&
            totalToolCalls < maxToolRoundtrips
          ) {
            totalToolCalls += 1
            const newResponse = await streamText({
              ...streamConfig,
              messages: appendToolResultsToMessages({
                messages: streamConfig.messages,
                toolCalls,
                toolResults,
              }),
            })
            const reader = newResponse.toAIStream().getReader()
            await pumpStreamUntilDone(controller, reader)
            toolCalls = await newResponse.toolCalls
            if (toolCalls.length > 0)
              toolResults = (await newResponse.toolResults) as ToolResultPart[]
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
