import { ClientSideActionContext } from '@/types'
import { guessApiHost } from '@/utils/guessApiHost'
import { isNotEmpty } from '@typebot.io/lib/utils'

let abortController: AbortController | null = null

export const streamChat =
  (context: ClientSideActionContext) =>
  async (
    messages: {
      content?: string | undefined
      role?: 'system' | 'user' | 'assistant' | undefined
    }[],
    { onMessageStream }: { onMessageStream?: (message: string) => void }
  ): Promise<{ message?: string; error?: object }> => {
    try {
      abortController = new AbortController()

      const apiHost = context.apiHost

      const res = await fetch(
        `${
          isNotEmpty(apiHost) ? apiHost : guessApiHost()
        }/api/integrations/openai/streamer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: context.sessionId,
            messages,
          }),
          signal: abortController.signal,
        }
      )

      if (!res.ok) {
        return {
          error: {
            message: (await res.text()) || 'Failed to fetch the chat response.',
          },
        }
      }

      if (!res.body) {
        throw new Error('The response body is empty.')
      }

      let message = ''

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          break
        }
        const chunk = decoder.decode(value)
        message += chunk
        if (onMessageStream) onMessageStream(message)
        if (abortController === null) {
          reader.cancel()
          break
        }
      }

      abortController = null

      return { message }
    } catch (err) {
      console.error(err)
      // Ignore abort errors as they are expected.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((err as any).name === 'AbortError') {
        abortController = null
        return { error: { message: 'Request aborted' } }
      }

      if (err instanceof Error) return { error: { message: err.message } }

      return { error: { message: 'Failed to fetch the chat response.' } }
    }
  }
