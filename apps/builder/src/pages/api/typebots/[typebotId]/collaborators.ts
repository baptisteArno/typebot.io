import prisma from '@sniper.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { canReadSnipers } from '@/helpers/databaseRules'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { methodNotAllowed, notAuthenticated } from '@sniper.io/lib/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)
  const sniperId = req.query.sniperId as string
  if (req.method === 'GET') {
    const collaborators = await prisma.collaboratorsOnSnipers.findMany({
      where: { sniper: canReadSnipers(sniperId, user) },
      include: { user: { select: { name: true, image: true, email: true } } },
    })
    return res.send({
      collaborators,
    })
  }
  methodNotAllowed(res)
}

export default handler
