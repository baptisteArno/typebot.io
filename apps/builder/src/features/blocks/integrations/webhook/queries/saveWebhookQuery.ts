import { Webhook } from 'models'
import { sendRequest } from 'utils'

export const saveWebhookQuery = (
  webhookId: string,
  webhook: Partial<Webhook>
) =>
  sendRequest<{ webhook: Webhook }>({
    method: 'PUT',
    url: `/api/webhooks/${webhookId}`,
    body: webhook,
  })
