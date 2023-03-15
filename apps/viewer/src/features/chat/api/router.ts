import { router } from '@/helpers/server/trpc'
import { sendMessage } from './sendMessage'

export const chatRouter = router({
  sendMessage,
})
