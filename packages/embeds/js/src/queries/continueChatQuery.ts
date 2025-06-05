import { guessApiHost } from '@/utils/guessApiHost'
import { isNotEmpty } from '@typebot.io/lib'
import { ContinueChatResponse } from '@typebot.io/schemas'
import ky from 'ky'

export const continueChatQuery = async ({
  apiHost,
  message,
  sessionId,
  apiToken,
}: {
  apiHost?: string
  message: string | undefined
  sessionId: string
  apiToken?: string
}) => {
  const headers = apiToken ? { Authorization: `Bearer ${apiToken}` } : {}
  try {
    const data = await ky
      .post(
        `${
          isNotEmpty(apiHost) ? apiHost : guessApiHost()
        }/api/v1/sessions/${sessionId}/continueChat`,
        {
          json: {
            message,
          },
          timeout: false,
          headers,
        }
      )
      .json<ContinueChatResponse>()

    return { data }
  } catch (error) {
    return { error }
  }
}
