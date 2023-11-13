import { sendMessageV1 } from '@/features/chat/api/legacy/sendMessageV1'
import { whatsAppRouter } from '@/features/whatsapp/api/router'
import { router } from './trpc'
import { updateTypebotInSession } from '@/features/chat/api/updateTypebotInSession'
import { getUploadUrl } from '@/features/fileUpload/api/deprecated/getUploadUrl'
import { generateUploadUrl } from '@/features/fileUpload/api/generateUploadUrl'
import { sendMessageV2 } from '@/features/chat/api/legacy/sendMessageV2'
import { continueChat } from '@/features/chat/api/continueChat'
import { saveClientLogs } from '@/features/chat/api/saveClientLogs'
import { startChat } from '@/features/chat/api/startChat'
import { startChatPreview } from '@/features/chat/api/startChatPreview'

export const appRouter = router({
  sendMessageV1,
  sendMessageV2,
  startChat,
  continueChat,
  startChatPreview: startChatPreview,
  getUploadUrl,
  generateUploadUrl,
  updateTypebotInSession,
  whatsAppRouter,
  saveClientLogs,
})

export type AppRouter = typeof appRouter
