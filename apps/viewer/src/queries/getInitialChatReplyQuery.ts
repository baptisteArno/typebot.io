import { InitialChatReply, SendMessageInput } from 'models'
import { sendRequest } from 'utils'

type Props = {
  typebotId: string
  resultId?: string
  prefilledVariables?: Record<string, string>
}
export async function getInitialChatReplyQuery({
  typebotId,
  resultId,
  prefilledVariables,
}: Props) {
  if (!typebotId)
    throw new Error('Typebot ID is required to get initial messages')

  return sendRequest<InitialChatReply>({
    method: 'POST',
    url: `/api/v1/sendMessage`,
    body: {
      startParams: {
        typebotId,
        resultId,
        prefilledVariables,
      },
    } satisfies SendMessageInput,
  })
}
