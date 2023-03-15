import { Webhook } from '@typebot.io/schemas'
import { sendRequest } from '@typebot.io/lib'

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
