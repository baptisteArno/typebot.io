import { getOpenAiStreamerQuery } from '@/queries/getOpenAiStreamerQuery'
import { ClientSideActionContext } from '@/types'

export const streamChat =
  (context: ClientSideActionContext) =>
  async (
    messages: {
      content?: string | undefined
      role?: 'system' | 'user' | 'assistant' | undefined
    }[],
    { onStreamedMessage }: { onStreamedMessage?: (message: string) => void }
  ) => {
    const data = await getOpenAiStreamerQuery(context)(messages)

    if (!data) {
      return
    }

    const reader = data.getReader()
    const decoder = new TextDecoder()
    let done = false

    let message = ''
    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading
      const chunkValue = decoder.decode(value)
      message += chunkValue
      onStreamedMessage?.(message)
    }
    return message
  }
