import { router } from '@/helpers/server/trpc'
import { getTotalAnswers } from './getTotalAnswers'
import { getTotalVisitedEdges } from './getTotalVisitedEdges'
import { getStats } from './getStats'

export const analyticsRouter = router({
  getTotalAnswers,
  getTotalVisitedEdges,
  getStats,
})
