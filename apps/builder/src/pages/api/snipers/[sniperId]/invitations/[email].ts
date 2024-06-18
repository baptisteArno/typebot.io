import { Invitation } from '@sniper.io/prisma'
import prisma from '@sniper.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { canEditGuests } from '@/helpers/databaseRules'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { methodNotAllowed, notAuthenticated } from '@sniper.io/lib/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)
  const sniperId = req.query.sniperId as string
  const email = req.query.email as string
  if (req.method === 'PATCH') {
    const data = req.body as Invitation
    await prisma.invitation.updateMany({
      where: { email, sniper: canEditGuests(user, sniperId) },
      data: { type: data.type },
    })
    return res.send({
      message: 'success',
    })
  }
  if (req.method === 'DELETE') {
    await prisma.invitation.deleteMany({
      where: {
        email,
        sniper: canEditGuests(user, sniperId),
      },
    })
    return res.send({
      message: 'success',
    })
  }
  methodNotAllowed(res)
}

export default handler
