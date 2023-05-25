import { parseVariableNumber } from '@/features/variables/parseVariableNumber'
import { Connection } from '@planetscale/database'
import { decrypt } from '@typebot.io/lib/api/encryption'
import {
  ChatCompletionOpenAIOptions,
  OpenAICredentials,
} from '@typebot.io/schemas/features/blocks/integrations/openai'
import { SessionState } from '@typebot.io/schemas/features/chat'
import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from 'eventsource-parser'
import type {
  ChatCompletionRequestMessage,
  CreateChatCompletionRequest,
} from 'openai'

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

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    let counter = 0

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      method: 'POST',
      body: JSON.stringify({
        messages,
        model: options.model,
        temperature,
        stream: true,
      } satisfies CreateChatCompletionRequest),
    })

    const stream = new ReadableStream({
      async start(controller) {
        function onParse(event: ParsedEvent | ReconnectInterval) {
          if (event.type === 'event') {
            const data = event.data
            if (data === '[DONE]') {
              controller.close()
              return
            }
            try {
              const json = JSON.parse(data) as {
                choices: { delta: { content: string } }[]
              }
              const text = json.choices.at(0)?.delta.content
              if (counter < 2 && (text?.match(/\n/) || []).length) {
                return
              }
              const queue = encoder.encode(text)
              controller.enqueue(queue)
              counter++
            } catch (e) {
              controller.error(e)
            }
          }
        }

        // stream response (SSE) from OpenAI may be fragmented into multiple chunks
        // this ensures we properly read chunks & invoke an event for each SSE event stream
        const parser = createParser(onParse)

        // https://web.dev/streams/#asynchronous-iteration
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for await (const chunk of res.body as any) {
          parser.feed(decoder.decode(chunk))
        }
      },
    })

    return stream
  }
