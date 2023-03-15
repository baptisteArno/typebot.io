import { Variable, WebhookResponse } from '@typebot.io/schemas'
import { getViewerUrl, sendRequest } from '@typebot.io/lib'

export const executeWebhook = (
  typebotId: string,
  variables: Variable[],
  { blockId }: { blockId: string }
) =>
  sendRequest<WebhookResponse>({
    url: `${getViewerUrl()}/api/typebots/${typebotId}/blocks/${blockId}/executeWebhook`,
    method: 'POST',
    body: {
      variables,
    },
  })
