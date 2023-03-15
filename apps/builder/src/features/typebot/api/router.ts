import { router } from '@/helpers/server/trpc'
import { listTypebots } from './listTypebots'

export const typebotRouter = router({
  listTypebots,
})
