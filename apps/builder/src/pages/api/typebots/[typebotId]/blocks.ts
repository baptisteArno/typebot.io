import prisma from '@sniper.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { canReadSnipers } from '@/helpers/databaseRules'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import {
  methodNotAllowed,
  notAuthenticated,
  notFound,
} from '@sniper.io/lib/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)
  if (req.method === 'GET') {
    const sniperId = req.query.sniperId as string
    const sniper = await prisma.sniper.findFirst({
      where: canReadSnipers(sniperId, user),
      select: { groups: true },
    })
    if (!sniper) return notFound(res)
    return res.send({ groups: sniper.groups })
  }
  methodNotAllowed(res)
}

export default handler
