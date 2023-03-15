import { guessApiHost } from '@/utils/guessApiHost'
import type { ChatReply, SendMessageInput } from '@typebot.io/schemas'
import { isNotEmpty, sendRequest } from '@typebot.io/lib'

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
