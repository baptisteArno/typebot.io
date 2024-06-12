import { router } from '@/helpers/server/trpc'
import { getStats } from './getStats'
import { getInDepthAnalyticsData } from './getInDepthAnalyticsData'

export const analyticsRouter = router({
  getInDepthAnalyticsData,
  getStats,
})
