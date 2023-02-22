import { guessApiHost } from '@/utils/guessApiHost'
import type { ChatReply, SendMessageInput } from 'models'
import { isNotEmpty, sendRequest } from 'utils'

export async function sendMessageQuery({
  apiHost,
  ...body
}: SendMessageInput & { apiHost?: string }) {
  const response = await sendRequest<ChatReply>({
    method: 'POST',
    url: `${isNotEmpty(apiHost) ? apiHost : guessApiHost()}/api/v1/sendMessage`,
    body,
  })

  return response.data
}
