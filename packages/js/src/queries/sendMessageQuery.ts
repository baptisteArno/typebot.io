import { ChatReply, SendMessageInput } from 'models'
import { getViewerUrl, sendRequest } from 'utils'

export async function sendMessageQuery({
  apiHost,
  ...body
}: SendMessageInput & { apiHost?: string }) {
  const response = await sendRequest<ChatReply>({
    method: 'POST',
    url: `${apiHost ?? getViewerUrl()}/api/v1/sendMessage`,
    body,
  })

  return response.data
}
