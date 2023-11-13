import { guessApiHost } from '@/utils/guessApiHost'
import { isNotEmpty, sendRequest } from '@typebot.io/lib'
import { ContinueChatResponse } from '@typebot.io/schemas'

export const continueChatQuery = ({
  apiHost,
  message,
  sessionId,
}: {
  apiHost?: string
  message: string | undefined
  sessionId: string
}) =>
  sendRequest<ContinueChatResponse>({
    method: 'POST',
    url: `${
      isNotEmpty(apiHost) ? apiHost : guessApiHost()
    }/api/v1/sessions/${sessionId}/continueChat`,
    body: {
      message,
    },
  })
