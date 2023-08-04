import { getUploadUrl } from '@/features/blocks/inputs/fileUpload/api/getUploadUrl'
import { sendMessage } from '@/features/chat/api/sendMessage'
import { router } from '../../trpc'
import { updateTypebotInSession } from '@/features/chat/api/updateTypebotInSession'

export const appRouter = router({
  sendMessage,
  getUploadUrl,
  updateTypebotInSession,
})

export type AppRouter = typeof appRouter
