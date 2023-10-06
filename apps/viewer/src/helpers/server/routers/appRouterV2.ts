import { sendMessageV2 } from '@/features/chat/api/sendMessageV2'
import { whatsAppRouter } from '@/features/whatsapp/api/router'
import { router } from '../trpc'
import { updateTypebotInSession } from '@/features/chat/api/updateTypebotInSession'
import { getUploadUrl } from '@/features/fileUpload/api/deprecated/getUploadUrl'
import { generateUploadUrl } from '@/features/fileUpload/api/generateUploadUrl'

export const appRouter = router({
  sendMessageV2,
  getUploadUrl,
  generateUploadUrl,
  updateTypebotInSession,
  whatsAppRouter,
})

export type AppRouter = typeof appRouter
