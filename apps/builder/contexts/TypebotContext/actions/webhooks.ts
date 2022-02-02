import { Typebot, Webhook } from 'models'
import { WritableDraft } from 'immer/dist/internal'
import { SetTypebot } from '../TypebotContext'
import { produce } from 'immer'

export type WebhooksAction = {
  createWebhook: (webook: Webhook) => void
  updateWebhook: (
    webhookId: string,
    updates: Partial<Omit<Webhook, 'id'>>
  ) => void
  deleteWebhook: (variableId: string) => void
}

export const webhooksAction = (
  typebot: Typebot,
  setTypebot: SetTypebot
): WebhooksAction => ({
  createWebhook: (newWebhook: Webhook) => {
    setTypebot(produce(typebot, createWebhookDraft(newWebhook)))
  },
  updateWebhook: (webhookId: string, updates: Partial<Omit<Webhook, 'id'>>) =>
    setTypebot(
      produce(typebot, (typebot) => {
        typebot.webhooks.byId[webhookId] = {
          ...typebot.webhooks.byId[webhookId],
          ...updates,
        }
      })
    ),
  deleteWebhook: (webhookId: string) => {
    setTypebot(produce(typebot, deleteWebhookDraft(webhookId)))
  },
})

export const createWebhookDraft =
  (newWebhook: Webhook) => (typebot: WritableDraft<Typebot>) => {
    typebot.webhooks.byId[newWebhook.id] = newWebhook
    typebot.webhooks.allIds.push(newWebhook.id)
  }

export const deleteWebhookDraft =
  (webhookId?: string) => (typebot: WritableDraft<Typebot>) => {
    if (!webhookId) return
    delete typebot.webhooks.byId[webhookId]
    const index = typebot.webhooks.allIds.indexOf(webhookId)
    if (index !== -1) typebot.webhooks.allIds.splice(index, 1)
  }
