import { parseVariableNumber } from '@/features/variables/parseVariableNumber'
import { Connection } from '@planetscale/database'
import { decrypt } from '@typebot.io/lib/api/encryption'
import { isNotEmpty } from '@typebot.io/lib/utils'
import {
  ChatCompletionOpenAIOptions,
  OpenAICredentials,
} from '@typebot.io/schemas/features/blocks/integrations/openai'
import { SessionState } from '@typebot.io/schemas/features/chat/sessionState'
import { OpenAIStream } from 'ai'
import {
  ChatCompletionRequestMessage,
  Configuration,
  OpenAIApi,
} from 'openai-edge'

export const getChatCompletionStream =
  (conn: Connection) =>
  async (
    state: SessionState,
    options: ChatCompletionOpenAIOptions,
    messages: ChatCompletionRequestMessage[]
  ) => {
    if (!options.credentialsId) return
    const credentials = (
      await conn.execute('select data, iv from Credentials where id=?', [
        options.credentialsId,
      ])
    ).rows.at(0) as { data: string; iv: string } | undefined
    if (!credentials) {
      console.error('Could not find credentials in database')
      return
    }
    const { apiKey } = (await decrypt(
      credentials.data,
      credentials.iv
    )) as OpenAICredentials['data']

    const { typebot } = state.typebotsQueue[0]
    const temperature = parseVariableNumber(typebot.variables)(
      options.advancedSettings?.temperature
    )

    const config = new Configuration({
      apiKey,
      basePath: options.baseUrl,
      baseOptions: {
        headers: {
          'api-key': apiKey,
        },
      },
      defaultQueryParams: isNotEmpty(options.apiVersion)
        ? new URLSearchParams({
            'api-version': options.apiVersion,
          })
        : undefined,
    })

    const openai = new OpenAIApi(config)

    const response = await openai.createChatCompletion({
      model: options.model,
      temperature,
      stream: true,
      messages,
    })

    if (!response.ok) return response

    return OpenAIStream(response)
  }
