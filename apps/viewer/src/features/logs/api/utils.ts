import prisma from '@/lib/prisma'

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
      details: formatDetails(details) as string,
    },
  })
}

const formatDetails = (details: unknown) => {
  try {
    return JSON.stringify(details, null, 2).substring(0, 1000)
  } catch {
    return details
  }
}
