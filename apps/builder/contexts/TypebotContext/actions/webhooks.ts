import { Typebot, Webhook } from 'models'
import { Updater } from 'use-immer'
import { WritableDraft } from 'immer/dist/internal'

export type WebhooksAction = {
  createWebhook: (webook: Webhook) => void
  updateWebhook: (
    webhookId: string,
    updates: Partial<Omit<Webhook, 'id'>>
  ) => void
  deleteWebhook: (variableId: string) => void
}

export const webhooksAction = (
  setTypebot: Updater<Typebot>
): WebhooksAction => ({
  createWebhook: (newWebhook: Webhook) => {
    setTypebot((typebot) => {
      typebot.webhooks.byId[newWebhook.id] = newWebhook
      typebot.webhooks.allIds.push(newWebhook.id)
    })
  },
  updateWebhook: (webhookId: string, updates: Partial<Omit<Webhook, 'id'>>) =>
    setTypebot((typebot) => {
      typebot.webhooks.byId[webhookId] = {
        ...typebot.webhooks.byId[webhookId],
        ...updates,
      }
    }),
  deleteWebhook: (webhookId: string) => {
    setTypebot(deleteWebhookDraft(webhookId))
  },
})

export const deleteWebhookDraft =
  (webhookId?: string) => (typebot: WritableDraft<Typebot>) => {
    if (!webhookId) return
    delete typebot.webhooks.byId[webhookId]
    const index = typebot.webhooks.allIds.indexOf(webhookId)
    if (index !== -1) typebot.webhooks.allIds.splice(index, 1)
  }
