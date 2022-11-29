import { saveLog } from './utils'

export const saveSuccessLog = ({
  resultId,
  message,
  details,
}: {
  resultId: string | undefined
  message: string
  details?: unknown
}) => saveLog('success', resultId, message, details)
