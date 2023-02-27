import { billingRouter } from '@/features/billing/api/router'
import { webhookRouter } from '@/features/blocks/integrations/webhook/api'
import { getAppVersionProcedure } from '@/features/dashboard/api/getAppVersionProcedure'
import { resultsRouter } from '@/features/results/api'
import { typebotRouter } from '@/features/typebot/api'
import { workspaceRouter } from '@/features/workspace/api'
import { router } from '../../trpc'

export const trpcRouter = router({
  getAppVersionProcedure,
  workspace: workspaceRouter,
  typebot: typebotRouter,
  webhook: webhookRouter,
  results: resultsRouter,
  billing: billingRouter,
})

export type AppRouter = typeof trpcRouter
