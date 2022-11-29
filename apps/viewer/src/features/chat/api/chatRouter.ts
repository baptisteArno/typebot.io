import { router } from '@/utils/server/trpc'
import { sendMessageProcedure } from './procedures'

export const chatRouter = router({
  sendMessage: sendMessageProcedure,
})
