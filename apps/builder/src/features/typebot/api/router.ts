import { router } from '@/utils/server/trpc'
import { listTypebotsProcedure } from './procedures'

export const typebotRouter = router({
  listTypebots: listTypebotsProcedure,
})
