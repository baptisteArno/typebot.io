import { getAppVersionProcedure } from '@/features/dashboard/api/getAppVersionProcedure'
import { processTelemetryEvent } from '@/features/telemetry/api/processTelemetryEvent'
import { router } from '../trpc'
import { generateUploadUrl } from '@/features/upload/api/generateUploadUrl'
import { openAIRouter } from '@/features/blocks/integrations/openai/api/router'
import { whatsAppRouter } from '@/features/whatsapp/router'
import { zemanticAiRouter } from '@/features/blocks/integrations/zemanticAi/api/router'

export const internalRouter = router({
  getAppVersionProcedure,
  processTelemetryEvent,
  generateUploadUrl,
  whatsApp: whatsAppRouter,
  openAI: openAIRouter,
  zemanticAI: zemanticAiRouter,
})

export type InternalRouter = typeof internalRouter
