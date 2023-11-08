import { router } from '@/helpers/server/trpc'
import { getTotalAnswers } from './getTotalAnswers'
import { getTotalVisitedEdges } from './getTotalVisitedEdges'

export const analyticsRouter = router({
  getTotalAnswers,
  getTotalVisitedEdges,
})
