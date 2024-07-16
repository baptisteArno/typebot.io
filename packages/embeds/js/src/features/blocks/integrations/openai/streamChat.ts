import { ClientSideActionContext } from '@/types'
import { readDataStream } from '@ai-sdk/ui-utils'
import { guessApiHost } from '@/utils/guessApiHost'
import { isNotEmpty } from '@typebot.io/lib/utils'
import { createUniqueId } from 'solid-js'

let abortController: AbortController | null = null
const secondsToWaitBeforeRetries = 3
const maxRetryAttempts = 1

export const streamChat =
  (context: ClientSideActionContext & { retryAttempt?: number }) =>
  async ({
    messages,
    onMessageStream,
  }: {
    messages?: {
      content?: string | undefined
      role?: 'system' | 'user' | 'assistant' | undefined
    }[]
    onMessageStream?: (props: { id: string; message: string }) => void
  }): Promise<{ message?: string; error?: object }> => {
    try {
      abortController = new AbortController()

      const apiHost = context.apiHost

      const res = await fetch(
        (isNotEmpty(apiHost) ? apiHost : guessApiHost()) +
          `/api/v2/sessions/${context.sessionId}/streamMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages,
          }),
          signal: abortController.signal,
        }
      )

      if (!res.ok) {
        if (
          (context.retryAttempt ?? 0) < maxRetryAttempts &&
          (res.status === 403 || res.status === 500 || res.status === 503)
        ) {
          await new Promise((resolve) =>
            setTimeout(resolve, secondsToWaitBeforeRetries * 1000)
          )
          return streamChat({
            ...context,
            retryAttempt: (context.retryAttempt ?? 0) + 1,
          })({ messages, onMessageStream })
        }
        return {
          error: (await res.json()) || 'Failed to fetch the chat response.',
        }
      }

      if (!res.body) {
        throw new Error('The response body is empty.')
      }

      let message = ''

      const reader = res.body.getReader()

      const id = createUniqueId()

      for await (const { type, value } of readDataStream(reader, {
        isAborted: () => abortController === null,
      })) {
        if (type === 'text') {
          message += value
          if (onMessageStream) onMessageStream({ id, message })
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
