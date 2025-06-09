import { guessApiHost } from '@/utils/guessApiHost'
import type { ChatLog } from '@typebot.io/schemas'
import { isNotEmpty } from '@typebot.io/lib'
import ky from 'ky'

export const saveClientLogsQuery = async ({
  apiHost,
  sessionId,
  apiToken,
  clientLogs,
}: {
  apiHost?: string
  sessionId: string
  apiToken?: string
  clientLogs: ChatLog[]
}) => {
  const headers = apiToken ? { Authorization: `Bearer ${apiToken}` } : {}

  try {
    await ky.post(
      `${
        isNotEmpty(apiHost) ? apiHost : guessApiHost()
      }/api/v1/sessions/${sessionId}/clientLogs`,
      {
        json: {
          clientLogs,
        },
        headers,
      }
    )
  } catch (e) {
    console.log(e)
  }
}
