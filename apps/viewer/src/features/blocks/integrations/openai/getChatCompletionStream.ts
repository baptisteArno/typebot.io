import { parseVariableNumber } from '@/features/variables/parseVariableNumber'
import { Connection } from '@planetscale/database'
import { decrypt } from '@typebot.io/lib/api/encryption'
import {
  ChatCompletionOpenAIOptions,
  OpenAICredentials,
} from '@typebot.io/schemas/features/blocks/integrations/openai'
import { SessionState } from '@typebot.io/schemas/features/chat'
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

    const temperature = parseVariableNumber(state.typebot.variables)(
      options.advancedSettings?.temperature
    )

    const config = new Configuration({
      apiKey,
    })

    const openai = new OpenAIApi(config)

    const response = await openai.createChatCompletion({
      model: options.model,
      temperature,
      stream: true,
      messages,
    })

    return OpenAIStream(response)
  }
