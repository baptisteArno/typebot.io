import { getAppVersionProcedure } from '@/features/dashboard/api/getAppVersionProcedure'
import { router } from '../trpc'
import { generateUploadUrl } from '@/features/upload/api/generateUploadUrl'
import { openAIRouter } from '@/features/blocks/integrations/openai/api/router'
import { internalWhatsAppRouter } from '@/features/whatsapp/router'
import { forgeRouter } from '@/features/forge/api/router'
import { googleSheetsRouter } from '@/features/blocks/integrations/googleSheets/api/router'
import { telemetryRouter } from '@/features/telemetry/api/router'
import { assignChatRouter } from '@/features/blocks/logic/assignChat/api/router'
import { triggerWhatsappFlowRouter } from '@/features/blocks/logic/triggerWhatsappFlow/api/router'

export const internalRouter = router({
  getAppVersionProcedure,
  generateUploadUrl,
  whatsAppInternal: internalWhatsAppRouter,
  openAI: openAIRouter,
  forge: forgeRouter,
  sheets: googleSheetsRouter,
  telemetry: telemetryRouter,
  assignChat: assignChatRouter,
  triggerWhatsappFlow: triggerWhatsappFlowRouter,
})

export type InternalRouter = typeof internalRouter
