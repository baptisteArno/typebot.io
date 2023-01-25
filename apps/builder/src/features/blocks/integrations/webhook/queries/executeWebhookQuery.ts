import { Variable, WebhookResponse } from 'models'
import { getViewerUrl, sendRequest } from 'utils'

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
