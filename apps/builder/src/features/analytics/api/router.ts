import { router } from '@/helpers/server/trpc'
import { getTotalAnswersInBlocks } from './getTotalAnswersInBlocks'

export const analyticsRouter = router({
  getTotalAnswersInBlocks,
})
