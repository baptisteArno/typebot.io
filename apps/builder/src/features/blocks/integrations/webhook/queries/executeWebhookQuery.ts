import { Variable, WebhookResponse } from '@typebot.io/schemas'
import { sendRequest } from '@typebot.io/lib'
import { env } from '@typebot.io/env'

export const executeWebhook = (
  typebotId: string,
  variables: Variable[],
  { blockId }: { blockId: string }
) =>
  sendRequest<WebhookResponse>({
    url: `${env.NEXT_PUBLIC_VIEWER_URL[0]}/api/typebots/${typebotId}/blocks/${blockId}/executeWebhook`,
    method: 'POST',
    body: {
      variables,
    },
  })
