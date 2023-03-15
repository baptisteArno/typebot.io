import { saveLog } from './saveLog'

export const saveSuccessLog = ({
  resultId,
  message,
  details,
}: {
  resultId: string | undefined
  message: string
  details?: unknown
}) => saveLog('success', resultId, message, details)
