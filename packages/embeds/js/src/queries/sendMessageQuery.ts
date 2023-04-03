import { guessApiHost } from '@/utils/guessApiHost'
import type { ChatReply, SendMessageInput } from '@typebot.io/schemas'
import { isNotEmpty, sendRequest } from '@typebot.io/lib'

export const sendMessageQuery = ({
  apiHost,
  ...body
}: SendMessageInput & { apiHost?: string }) =>
  sendRequest<ChatReply>({
    method: 'POST',
    url: `${isNotEmpty(apiHost) ? apiHost : guessApiHost()}/api/v1/sendMessage`,
    body,
  })
