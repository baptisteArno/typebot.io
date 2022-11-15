import { saveLog } from './utils'

export const saveErrorLog = (
  resultId: string | undefined,
  message: string,
  details?: unknown
) => saveLog('error', resultId, message, details)
