import { Webhook } from 'models'
import { sendRequest } from 'utils'

type Props = {
  typebotId: string
  data: Partial<Omit<Webhook, 'typebotId'>>
}

export const createWebhookQuery = ({ typebotId, data }: Props) =>
  sendRequest<{ webhook: Webhook }>({
    method: 'POST',
    url: `/api/typebots/${typebotId}/webhooks`,
    body: { data },
  })
