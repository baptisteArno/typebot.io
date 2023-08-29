import { getUploadUrl } from '@/features/blocks/inputs/fileUpload/api/getUploadUrl'
import { sendMessage } from '@/features/chat/api/sendMessage'
import { whatsAppRouter } from '@/features/whatsApp/api/router'
import { router } from '../../trpc'
import { updateTypebotInSession } from '@/features/chat/api/updateTypebotInSession'

export const appRouter = router({
  sendMessage,
  getUploadUrl,
  updateTypebotInSession,
  whatsAppRouter,
})

export type AppRouter = typeof appRouter
