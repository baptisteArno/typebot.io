import { InitialChatReply } from '@/types'
import { SendMessageInput, StartParams } from 'models'
import { getViewerUrl, isEmpty, sendRequest } from 'utils'

export async function getInitialChatReplyQuery({
  typebot,
  isPreview,
  apiHost,
  prefilledVariables,
  startGroupId,
  resultId,
}: StartParams & {
  apiHost?: string
}) {
  if (!typebot)
    throw new Error('Typebot ID is required to get initial messages')

  return sendRequest<InitialChatReply>({
    method: 'POST',
    url: `${isEmpty(apiHost) ? getViewerUrl() : apiHost}/api/v1/sendMessage`,
    body: {
      startParams: {
        isPreview,
        typebot,
        prefilledVariables,
        startGroupId,
        resultId,
      },
    } satisfies SendMessageInput,
  })
}
