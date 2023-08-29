import { router } from '@/helpers/server/trpc'
import { receiveMessagePreview } from './receiveMessagePreview'
import { startWhatsAppPreview } from './startWhatsAppPreview'
import { subscribePreviewWebhook } from './subscribePreviewWebhook'
import { subscribeWebhook } from './subscribeWebhook'
import { receiveMessage } from './receiveMessage'

export const whatsAppRouter = router({
  subscribePreviewWebhook,
  subscribeWebhook,
  receiveMessagePreview,
  receiveMessage,
  startWhatsAppPreview,
})
