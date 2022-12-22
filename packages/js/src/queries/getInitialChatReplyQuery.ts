import { InitialChatReply, SendMessageInput, StartParams } from 'models'
import { getViewerUrl, sendRequest } from 'utils'

export async function getInitialChatReplyQuery({
  typebotId,
  isPreview,
  apiHost,
  prefilledVariables,
}: StartParams & {
  apiHost?: string
}) {
  if (!typebotId)
    throw new Error('Typebot ID is required to get initial messages')

  const response = await sendRequest<InitialChatReply>({
    method: 'POST',
    url: `${apiHost ?? getViewerUrl()}/api/v1/sendMessage`,
    body: {
      startParams: {
        isPreview,
        typebotId,
        prefilledVariables,
      },
    } satisfies SendMessageInput,
  })

  return response.data
}
