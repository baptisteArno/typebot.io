import { webhookRouter } from '@/features/blocks/integrations/webhook/api'
import { resultsRouter } from '@/features/results/api'
import { typebotRouter } from '@/features/typebot/api'
import { workspaceRouter } from '@/features/workspace/api'
import { router } from '../../trpc'

export const trpcRouter = router({
  workspace: workspaceRouter,
  typebot: typebotRouter,
  webhook: webhookRouter,
  results: resultsRouter,
})

export type AppRouter = typeof trpcRouter
