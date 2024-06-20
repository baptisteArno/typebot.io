import { decryptV2 } from '@sniper.io/lib/api/encryption/decryptV2'
import { isNotEmpty } from '@sniper.io/lib/utils'
import {
  ChatCompletionOpenAIOptions,
  OpenAICredentials,
} from '@sniper.io/schemas/features/blocks/integrations/openai'
import { SessionState } from '@sniper.io/schemas/features/chat/sessionState'
import { OpenAIStream } from 'ai'
import { parseVariableNumber } from '@sniper.io/variables/parseVariableNumber'
import { ClientOptions, OpenAI } from 'openai'
import { defaultOpenAIOptions } from '@sniper.io/schemas/features/blocks/integrations/openai/constants'
import { getCredentials } from '../../queries/getCredentials'

export const getOpenAIChatCompletionStream = async (
  state: SessionState,
  options: ChatCompletionOpenAIOptions,
  messages: OpenAI.Chat.ChatCompletionMessageParam[]
) => {
  if (!options.credentialsId) return
  const credentials = await getCredentials(options.credentialsId)
  if (!credentials) {
    console.error('Could not find credentials in database')
    return
  }
  const { apiKey } = (await decryptV2(
    credentials.data,
    credentials.iv
  )) as OpenAICredentials['data']

  const { sniper } = state.snipersQueue[0]
  const temperature = parseVariableNumber(sniper.variables)(
    options.advancedSettings?.temperature
  )

  const config = {
    apiKey,
    baseURL: options.baseUrl,
    defaultHeaders: {
      'api-key': apiKey,
    },
    defaultQuery: isNotEmpty(options.apiVersion)
      ? {
          'api-version': options.apiVersion,
        }
      : undefined,
  } satisfies ClientOptions

  const openai = new OpenAI(config)

  const response = await openai.chat.completions.create({
    model: options.model ?? defaultOpenAIOptions.model,
    temperature,
    stream: true,
    messages,
  })

  return OpenAIStream(response)
}
