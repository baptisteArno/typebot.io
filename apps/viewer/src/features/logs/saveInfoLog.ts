import { saveLog } from './saveLog'

export const saveInfoLog = ({
  resultId,
  message,
  details,
}: {
  resultId: string | undefined
  message: string
  details?: unknown
}) => saveLog({ status: 'info', resultId, message, details })
