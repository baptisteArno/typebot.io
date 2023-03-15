import { router } from '@/helpers/server/trpc'
import { deleteResults } from './deleteResults'
import { getResultLogs } from './getResultLogs'
import { getResults } from './getResults'

export const resultsRouter = router({
  getResults,
  deleteResults,
  getResultLogs,
})
