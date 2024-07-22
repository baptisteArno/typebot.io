import { router } from '@/helpers/server/trpc'
import { fetchSelectItems } from './fetchSelectItems'

export const forgeRouter = router({
  fetchSelectItems,
})
