import { router } from '@/helpers/server/trpc'
import { subscribeWebhook } from './subscribeWebhook'
import { receiveMessage } from './receiveMessage'

export const whatsAppRouter = router({
  subscribeWebhook,
  receiveMessage,
})
