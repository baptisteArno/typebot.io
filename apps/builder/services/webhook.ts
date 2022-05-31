import { Webhook } from 'models'
import { sendRequest } from 'utils'

export const saveWebhook = (webhookId: string, webhook: Partial<Webhook>) =>
  sendRequest<{ webhook: Webhook }>({
    method: 'PUT',
    url: `/api/webhooks/${webhookId}`,
    body: webhook,
  })

export const duplicateWebhook = async (
  typebotId: string,
  existingWebhookId: string,
  newWebhookId: string
): Promise<Webhook | undefined> => {
  const { data } = await sendRequest<{ webhook: Webhook }>(
    `/api/webhooks/${existingWebhookId}`
  )
  if (!data) return
  const newWebhook = { ...data.webhook, id: newWebhookId, typebotId }
  await saveWebhook(newWebhook.id, newWebhook)
  return newWebhook
}
