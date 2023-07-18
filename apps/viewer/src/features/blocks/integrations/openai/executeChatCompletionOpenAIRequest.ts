import { ChatReply } from '@typebot.io/schemas'
import got, { HTTPError } from 'got'
import type {
  CreateChatCompletionRequest,
  CreateChatCompletionResponse,
} from 'openai'

const createChatEndpoint = 'https://api.openai.com/v1/chat/completions'

type Props = Pick<CreateChatCompletionRequest, 'messages' | 'model'> & {
  apiKey: string
  temperature: number | undefined
  currentLogs?: ChatReply['logs']
  isRetrying?: boolean
}

export const executeChatCompletionOpenAIRequest = async ({
  apiKey,
  model,
  messages,
  temperature,
  currentLogs = [],
}: Props): Promise<{
  response?: CreateChatCompletionResponse
  logs?: ChatReply['logs']
}> => {
  const logs: ChatReply['logs'] = currentLogs
  if (messages.length === 0) return { logs }
  try {
    const response = await got
      .post(createChatEndpoint, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        json: {
          model,
          messages,
          temperature,
        } satisfies CreateChatCompletionRequest,
      })
      .json<CreateChatCompletionResponse>()
    return { response, logs }
  } catch (error) {
    if (error instanceof HTTPError) {
      if (error.response.statusCode === 503) {
        console.log('OpenAI API error - 503, retrying in 3 seconds')
        await new Promise((resolve) => setTimeout(resolve, 3000))
        return executeChatCompletionOpenAIRequest({
          apiKey,
          model,
          messages,
          temperature,
          currentLogs: logs,
        })
      }
      if (error.response.statusCode === 400) {
        const log = {
          status: 'info',
          description:
            'Max tokens limit reached, automatically trimming first message.',
        }
        logs.push(log)

        return executeChatCompletionOpenAIRequest({
          apiKey,
          model,
          messages: messages.slice(1),
          temperature,
          currentLogs: logs,
        })
      }
      logs.push({
        status: 'error',
        description: `OpenAI API error - ${error.response.statusCode}`,
        details: error.response.body,
      })
      return { logs }
    }
    logs.push({
      status: 'error',
      description: `Internal error`,
      details: error,
    })
    return { logs }
  }
}
