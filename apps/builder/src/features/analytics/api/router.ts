import { router } from '@/helpers/server/trpc'
import { getStats } from './getStats'
import { getInDepthAnalyticsData } from './getInDepthAnalyticsData'
import { getCxStats, getBlockVisitStats } from './getAnalyticsStats'

export const analyticsRouter = router({
  getInDepthAnalyticsData,
  getStats,
  getCxStats,
  getBlockVisitStats,
})
