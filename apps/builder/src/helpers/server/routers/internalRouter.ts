import { getAppVersionProcedure } from '@/features/dashboard/api/getAppVersionProcedure'
import { router } from '../trpc'
import { generateUploadUrl } from '@/features/upload/api/generateUploadUrl'
import { openAIRouter } from '@/features/blocks/integrations/openai/api/router'
import { internalWhatsAppRouter } from '@/features/whatsapp/router'
import { zemanticAiRouter } from '@/features/blocks/integrations/zemanticAi/api/router'
import { forgeRouter } from '@/features/forge/api/router'
import { googleSheetsRouter } from '@/features/blocks/integrations/googleSheets/api/router'

export const internalRouter = router({
  getAppVersionProcedure,
  generateUploadUrl,
  whatsAppInternal: internalWhatsAppRouter,
  openAI: openAIRouter,
  zemanticAI: zemanticAiRouter,
  forge: forgeRouter,
  sheets: googleSheetsRouter,
})

export type InternalRouter = typeof internalRouter
