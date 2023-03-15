import { Webhook } from '@typebot.io/schemas'
import { sendRequest } from '@typebot.io/lib'
import { createWebhookQuery } from './createWebhookQuery'

type Props = {
  existingIds: { typebotId: string; webhookId: string }
  newIds: { typebotId: string; webhookId: string }
}
export const duplicateWebhookQuery = async ({
  existingIds,
  newIds,
}: Props): Promise<Webhook | undefined> => {
  const { data } = await sendRequest<{ webhook: Webhook }>(
    `/api/typebots/${existingIds.typebotId}/webhooks/${existingIds.webhookId}`
  )
  if (!data) return
  const newWebhook = {
    ...data.webhook,
    id: newIds.webhookId,
    typebotId: newIds.typebotId,
  }
  await createWebhookQuery({
    typebotId: newIds.typebotId,
    data: { ...data.webhook, id: newIds.webhookId },
  })
  return newWebhook
}
