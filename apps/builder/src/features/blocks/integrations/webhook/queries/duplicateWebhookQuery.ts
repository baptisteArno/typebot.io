import { Webhook } from 'models'
import { sendRequest } from 'utils'
import { saveWebhookQuery } from './saveWebhookQuery'

export const duplicateWebhookQueries = async (
  typebotId: string,
  existingWebhookId: string,
  newWebhookId: string
): Promise<Webhook | undefined> => {
  const { data } = await sendRequest<{ webhook: Webhook }>(
    `/api/webhooks/${existingWebhookId}`
  )
  if (!data) return
  const newWebhook = { ...data.webhook, id: newWebhookId, typebotId }
  await saveWebhookQuery(newWebhook.id, newWebhook)
  return newWebhook
}
