import { guessApiHost } from '@/utils/guessApiHost'
import type { ChatLog } from '@sniper.io/schemas'
import { isNotEmpty } from '@sniper.io/lib'
import ky from 'ky'

export const saveClientLogsQuery = async ({
  apiHost,
  sessionId,
  clientLogs,
}: {
  apiHost?: string
  sessionId: string
  clientLogs: ChatLog[]
}) => {
  try {
    await ky.post(
      `${
        isNotEmpty(apiHost) ? apiHost : guessApiHost()
      }/api/v1/sessions/${sessionId}/clientLogs`,
      {
        json: {
          clientLogs,
        },
      }
    )
  } catch (e) {
    console.log(e)
  }
}
