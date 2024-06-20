import prisma from '@sniper.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { canEditGuests } from '@/helpers/databaseRules'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { methodNotAllowed, notAuthenticated } from '@sniper.io/lib/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)
  const sniperId = req.query.sniperId as string
  const userId = req.query.userId as string
  if (req.method === 'PATCH') {
    const data = req.body
    await prisma.collaboratorsOnSnipers.updateMany({
      where: { userId, sniper: canEditGuests(user, sniperId) },
      data: { type: data.type },
    })
    return res.send({
      message: 'success',
    })
  }
  if (req.method === 'DELETE') {
    await prisma.collaboratorsOnSnipers.deleteMany({
      where: { userId, sniper: canEditGuests(user, sniperId) },
    })
    return res.send({
      message: 'success',
    })
  }
  methodNotAllowed(res)
}

export default handler
