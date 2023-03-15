import prisma from '@/lib/prisma'
import { isNotDefined } from '@typebot.io/lib'

export const saveLog = (
  status: 'error' | 'success',
  resultId: string | undefined,
  message: string,
  details?: unknown
) => {
  if (!resultId || resultId === 'undefined') return
  return prisma.log.create({
    data: {
      resultId,
      status,
      description: message,
      details: formatDetails(details) as string | null,
    },
  })
}

const formatDetails = (details: unknown) => {
  if (isNotDefined(details)) return null
  try {
    return JSON.stringify(details, null, 2).substring(0, 1000)
  } catch {
    return details
  }
}
