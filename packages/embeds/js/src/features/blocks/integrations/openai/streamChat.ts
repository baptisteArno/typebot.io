import { getOpenAiStreamerQuery } from '@/queries/getOpenAiStreamerQuery'
import { ClientSideActionContext } from '@/types'
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from 'eventsource-parser'

export const streamChat =
  (context: ClientSideActionContext) =>
  async (
    messages: {
      content?: string | undefined
      role?: 'system' | 'user' | 'assistant' | undefined
    }[],
    {
      onStreamedMessage,
      isRetrying,
    }: { onStreamedMessage?: (message: string) => void; isRetrying?: boolean }
  ): Promise<{ message?: string; error?: object }> => {
    const data = await getOpenAiStreamerQuery(context)(messages)

    if (!data) return { error: { message: "Couldn't get streamer data" } }

    let message = ''

    const reader = data.getReader()
    const decoder = new TextDecoder()

    const onParse = (event: ParsedEvent | ReconnectInterval) => {
      if (event.type === 'event') {
        const data = event.data
        try {
          const json = JSON.parse(data) as {
            choices: { delta: { content: string } }[]
          }
          const text = json.choices.at(0)?.delta.content
          if (!text) return
          message += text
          onStreamedMessage?.(message)
        } catch (e) {
          console.error(e)
        }
      }
    }

    const parser = createParser(onParse)

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { value, done } = await reader.read()
      if (done || !value) break
      const dataString = decoder.decode(value)
      if (dataString.includes('503 Service Temporarily Unavailable')) {
        if (isRetrying)
          return { error: { message: "Couldn't get streamer data" } }
        await new Promise((resolve) => setTimeout(resolve, 3000))
        return streamChat(context)(messages, {
          onStreamedMessage,
          isRetrying: true,
        })
      }
      if (dataString.includes('[DONE]')) break
      if (dataString.includes('"error":')) {
        return { error: JSON.parse(dataString).error }
      }
      parser.feed(dataString)
    }

    return { message }
  }
