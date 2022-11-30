import { router } from '@/utils/server/trpc'
import {
  listWebhookBlocksProcedure,
  subscribeWebhookProcedure,
  unsubscribeWebhookProcedure,
  getResultExampleProcedure,
} from './procedures'

export const webhookRouter = router({
  listWebhookBlocks: listWebhookBlocksProcedure,
  getResultExample: getResultExampleProcedure,
  subscribeWebhook: subscribeWebhookProcedure,
  unsubscribeWebhook: unsubscribeWebhookProcedure,
})
