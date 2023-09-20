import { isNotEmpty } from '@typebot.io/lib/utils'
import { ChatReply } from '@typebot.io/schemas'
import { OpenAIBlock } from '@typebot.io/schemas/features/blocks/integrations/openai'
import { HTTPError } from 'got'
import {
  Configuration,
  OpenAIApi,
  type CreateChatCompletionRequest,
  type CreateChatCompletionResponse,
  ResponseTypes,
} from 'openai-edge'

type Props = Pick<CreateChatCompletionRequest, 'messages' | 'model'> & {
  apiKey: string
  temperature: number | undefined
  currentLogs?: ChatReply['logs']
  isRetrying?: boolean
} & Pick<OpenAIBlock['options'], 'apiVersion' | 'baseUrl'>

export const executeChatCompletionOpenAIRequest = async ({
  apiKey,
  model,
  messages,
  temperature,
  baseUrl,
  apiVersion,
  isRetrying,
  currentLogs = [],
}: Props): Promise<{
  response?: CreateChatCompletionResponse
  logs?: ChatReply['logs']
}> => {
  const logs: ChatReply['logs'] = currentLogs
  if (messages.length === 0) return { logs }
  try {
    const config = new Configuration({
      apiKey,
      basePath: baseUrl,
      baseOptions: {
        headers: {
          'api-key': apiKey,
        },
      },
      defaultQueryParams: isNotEmpty(apiVersion)
        ? new URLSearchParams({
            'api-version': apiVersion,
          })
        : undefined,
    })

    const openai = new OpenAIApi(config)

    const response = await openai.createChatCompletion({
      model,
      messages,
      temperature,
    })

    const completion =
      (await response.json()) as ResponseTypes['createChatCompletion']
    return { response: completion, logs }
  } catch (error) {
    if (error instanceof HTTPError) {
      if (
        (error.response.statusCode === 503 ||
          error.response.statusCode === 500 ||
          error.response.statusCode === 403) &&
        !isRetrying
      ) {
        console.log('OpenAI API error - 503, retrying in 3 seconds')
        await new Promise((resolve) => setTimeout(resolve, 3000))
        return executeChatCompletionOpenAIRequest({
          apiKey,
          model,
          messages,
          temperature,
          currentLogs: logs,
          baseUrl,
          apiVersion,
          isRetrying: true,
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
          baseUrl,
          apiVersion,
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
