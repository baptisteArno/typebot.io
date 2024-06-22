import { billingRouter } from '@/features/billing/api/router'
import { webhookRouter } from '@/features/blocks/integrations/webhook/api/router'
import { getLinkedSnipers } from '@/features/blocks/logic/sniperLink/api/getLinkedSnipers'
import { credentialsRouter } from '@/features/credentials/api/router'
import { resultsRouter } from '@/features/results/api/router'
import { themeRouter } from '@/features/theme/api/router'
import { sniperRouter } from '@/features/sniper/api/router'
import { workspaceRouter } from '@/features/workspace/api/router'
import { router } from '../trpc'
import { analyticsRouter } from '@/features/analytics/api/router'
import { collaboratorsRouter } from '@/features/collaboration/api/router'
import { customDomainsRouter } from '@/features/customDomains/api/router'
import { publicWhatsAppRouter } from '@/features/whatsapp/router'
import { folderRouter } from '@/features/folders/api/router'

export const publicRouter = router({
  getLinkedSnipers,
  analytics: analyticsRouter,
  workspace: workspaceRouter,
  sniper: sniperRouter,
  webhook: webhookRouter,
  results: resultsRouter,
  billing: billingRouter,
  credentials: credentialsRouter,
  theme: themeRouter,
  collaborators: collaboratorsRouter,
  customDomains: customDomainsRouter,
  whatsApp: publicWhatsAppRouter,
  folders: folderRouter,
})

export type PublicRouter = typeof publicRouter
