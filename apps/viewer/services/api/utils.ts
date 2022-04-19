import { User } from 'db'
import prisma from 'libs/prisma'
import { NextApiRequest } from 'next'

export const authenticateUser = async (
  req: NextApiRequest
): Promise<User | undefined> => authenticateByToken(extractBearerToken(req))

const authenticateByToken = async (
  apiToken?: string
): Promise<User | undefined> => {
  if (!apiToken) return
  return (await prisma.user.findFirst({ where: { apiToken } })) as User
}

const extractBearerToken = (req: NextApiRequest) =>
  req.headers['authorization']?.slice(7)

export const saveErrorLog = (
  resultId: string | undefined,
  message: string,
  details?: any
) => saveLog('error', resultId, message, details)

export const saveSuccessLog = (
  resultId: string | undefined,
  message: string,
  details?: any
) => saveLog('success', resultId, message, details)

const saveLog = (
  status: 'error' | 'success',
  resultId: string | undefined,
  message: string,
  details?: any
) => {
  if (!resultId) return
  return prisma.log.create({
    data: {
      resultId,
      status,
      description: message,
      details: formatDetails(details),
    },
  })
}

const formatDetails = (details: any) => {
  try {
    return JSON.stringify(details, null, 2).substring(0, 1000)
  } catch {
    return details
  }
}
