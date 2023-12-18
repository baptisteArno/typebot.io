import { getAppVersionProcedure } from '@/features/dashboard/api/getAppVersionProcedure'
import { router } from '../trpc'
import { generateUploadUrl } from '@/features/upload/api/generateUploadUrl'
import { openAIRouter } from '@/features/blocks/integrations/openai/api/router'
import { whatsAppRouter } from '@/features/whatsapp/router'
import { zemanticAiRouter } from '@/features/blocks/integrations/zemanticAi/api/router'
import { forgedCredentialsRouter } from '@/features/forge/api/credentials/router'
import { integrationsRouter } from '@/features/forge/api/router'
import { googleSheetsRouter } from '@/features/blocks/integrations/googleSheets/api/router'

export const internalRouter = router({
  getAppVersionProcedure,
  generateUploadUrl,
  whatsApp: whatsAppRouter,
  openAI: openAIRouter,
  zemanticAI: zemanticAiRouter,
  integrationCredentials: forgedCredentialsRouter,
  integrations: integrationsRouter,
  sheets: googleSheetsRouter,
})

export type InternalRouter = typeof internalRouter
