import { guessApiHost } from '@/utils/guessApiHost'
import { isNotEmpty } from '@typebot.io/lib'
import { ContinueChatResponse, Message } from '@typebot.io/schemas'
import ky from 'ky'

export const continueChatQuery = async ({
  apiHost,
  message,
  sessionId,
}: {
  apiHost?: string
  message?: Message
  sessionId: string
}) => {
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
        }
      )
      .json<ContinueChatResponse>()

    return { data }
  } catch (error) {
    return { error }
  }
}
