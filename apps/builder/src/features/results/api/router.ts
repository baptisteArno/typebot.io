import { router } from '@/utils/server/trpc'
import {
  deleteResultsProcedure,
  getResultLogsProcedure,
  getResultsProcedure,
} from './procedures'

export const resultsRouter = router({
  getResults: getResultsProcedure,
  deleteResults: deleteResultsProcedure,
  getResultLogs: getResultLogsProcedure,
})
