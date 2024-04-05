import { Variable, HttpResponse } from '@typebot.io/schemas'
import { sendRequest } from '@typebot.io/lib'

export const executeWebhook = (
  typebotId: string,
  variables: Variable[],
  { blockId }: { blockId: string }
) =>
  sendRequest<HttpResponse>({
    url: `/api/typebots/${typebotId}/blocks/${blockId}/testWebhook`,
    method: 'POST',
    body: {
      variables,
    },
  })
