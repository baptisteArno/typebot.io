import { getUploadUrl } from '@/features/blocks/inputs/fileUpload/api/deprecated/getUploadUrl'
import { generateUploadUrl } from '@/features/blocks/inputs/fileUpload/api/generateUploadUrl'
import { sendMessage } from '@/features/chat/api/sendMessage'
import { whatsAppRouter } from '@/features/whatsApp/api/router'
import { router } from '../../trpc'
import { updateTypebotInSession } from '@/features/chat/api/updateTypebotInSession'

export const appRouter = router({
  sendMessage,
  getUploadUrl,
  generateUploadUrl,
  updateTypebotInSession,
  whatsAppRouter,
})

export type AppRouter = typeof appRouter
