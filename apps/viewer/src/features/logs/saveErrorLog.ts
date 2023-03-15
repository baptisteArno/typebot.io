import { saveLog } from './saveLog'

export const saveErrorLog = ({
  resultId,
  message,
  details,
}: {
  resultId: string | undefined
  message: string
  details?: unknown
}) => saveLog('error', resultId, message, details)
