import { router } from '@/helpers/server/trpc'
import { listProjects } from './listProjects'

export const zemanticAiRouter = router({
  listProjects,
})
