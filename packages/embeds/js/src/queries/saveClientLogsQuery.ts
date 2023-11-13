import { guessApiHost } from '@/utils/guessApiHost'
import type { ChatLog } from '@typebot.io/schemas'
import { isNotEmpty, sendRequest } from '@typebot.io/lib'

export const saveClientLogsQuery = ({
  apiHost,
  sessionId,
  clientLogs,
}: {
  apiHost?: string
  sessionId: string
  clientLogs: ChatLog[]
}) =>
  sendRequest({
    method: 'POST',
    url: `${
      isNotEmpty(apiHost) ? apiHost : guessApiHost()
    }/api/v1/sessions/${sessionId}/clientLogs`,
    body: {
      clientLogs,
    },
  })
