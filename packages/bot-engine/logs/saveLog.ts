import prisma from '@typebot.io/lib/prisma'
import { formatLogDetails } from './helpers/formatLogDetails'

type Props = {
  status: 'error' | 'success' | 'info'
  resultId: string | undefined
  message: string
  details?: unknown
}

export const saveLog = ({ status, resultId, message, details }: Props) => {
  if (!resultId || resultId === 'undefined') return
  return prisma.log.create({
    data: {
      resultId,
      status,
      description: message,
      details: formatLogDetails(details) as string | null,
    },
  })
}
