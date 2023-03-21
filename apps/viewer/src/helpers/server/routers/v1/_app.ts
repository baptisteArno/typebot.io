import { getUploadUrl } from '@/features/blocks/inputs/fileUpload/api/getUploadUrl'
import { sendMessage } from '@/features/chat/api/sendMessage'
import { router } from '../../trpc'

export const appRouter = router({
  sendMessage,
  getUploadUrl,
})

export type AppRouter = typeof appRouter
