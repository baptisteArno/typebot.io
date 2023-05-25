import { guessApiHost } from '@/utils/guessApiHost'
import { isNotEmpty } from '@typebot.io/lib'

export const getOpenAiStreamerQuery =
  ({ apiHost, sessionId }: { apiHost?: string; sessionId: string }) =>
  async (
    messages: {
      content?: string | undefined
      role?: 'system' | 'user' | 'assistant' | undefined
    }[]
  ) => {
    const response = await fetch(
      `${
        isNotEmpty(apiHost) ? apiHost : guessApiHost()
      }/api/integrations/openai/streamer`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          messages,
        }),
      }
    )
    if (!response.ok) {
      throw new Error(response.statusText)
    }

    const data = response.body
    return data
  }
