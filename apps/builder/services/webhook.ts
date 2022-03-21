import cuid from 'cuid'
import { Webhook } from 'models'
import { sendRequest } from 'utils'

export const saveWebhook = (webhookId: string, webhook: Partial<Webhook>) =>
  sendRequest<{ webhook: Webhook }>({
    method: 'PUT',
    url: `/api/webhooks/${webhookId}`,
    body: webhook,
  })

export const duplicateWebhook = async (
  webhookId: string
): Promise<Webhook | undefined> => {
  const { data } = await sendRequest<{ webhook: Webhook }>(
    `/api/webhooks/${webhookId}`
  )
  if (!data) return
  const newWebhook = { ...data.webhook, id: cuid() }
  await saveWebhook(newWebhook.id, newWebhook)
  return newWebhook
}
