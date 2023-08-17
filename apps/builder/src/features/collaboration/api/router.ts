import { router } from '@/helpers/server/trpc'
import { getCollaborators } from './getCollaborators'

export const collaboratorsRouter = router({
  getCollaborators: getCollaborators,
})
