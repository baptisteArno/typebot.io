import { Webhook } from '@typebot.io/schemas'
import { sendRequest } from '@typebot.io/lib'

type Props = {
  typebotId: string
  webhookId: string
  data: Partial<Omit<Webhook, 'id' | 'typebotId'>>
}

export const updateWebhookQuery = ({ typebotId, webhookId, data }: Props) =>
  sendRequest<{ webhook: Webhook }>({
    method: 'PATCH',
    url: `/api/typebots/${typebotId}/webhooks/${webhookId}`,
    body: { data },
  })
