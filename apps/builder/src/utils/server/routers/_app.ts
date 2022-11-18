import { resultsRouter } from '@/features/results/api'
import { router } from '../trpc'

export const appRouter = router({
  results: resultsRouter,
})

export type AppRouter = typeof appRouter
