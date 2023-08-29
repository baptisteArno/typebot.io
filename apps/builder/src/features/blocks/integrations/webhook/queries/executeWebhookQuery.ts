import { Variable, WebhookResponse } from '@typebot.io/schemas'
import { sendRequest } from '@typebot.io/lib'
import { getViewerUrl } from '@typebot.io/lib/getViewerUrl'

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
