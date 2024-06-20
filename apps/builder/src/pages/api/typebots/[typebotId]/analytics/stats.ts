import prisma from '@sniper.io/lib/prisma'
import { Stats } from '@sniper.io/schemas'
import { NextApiRequest, NextApiResponse } from 'next'
import { canReadSnipers } from '@/helpers/databaseRules'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { methodNotAllowed, notAuthenticated } from '@sniper.io/lib/api'

// TODO: Delete, as it has been migrated to tRPC
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)
  if (req.method === 'GET') {
    const sniperId = req.query.sniperId as string

    const sniper = await prisma.sniper.findFirst({
      where: canReadSnipers(sniperId, user),
      select: { id: true },
    })

    if (!sniper) return res.status(404).send({ message: 'Sniper not found' })

    const [totalViews, totalStarts, totalCompleted] = await prisma.$transaction(
      [
        prisma.result.count({
          where: {
            sniperId: sniper.id,
            isArchived: false,
          },
        }),
        prisma.result.count({
          where: {
            sniperId: sniper.id,
            isArchived: false,
            hasStarted: true,
          },
        }),
        prisma.result.count({
          where: {
            sniperId: sniper.id,
            isArchived: false,
            isCompleted: true,
          },
        }),
      ]
    )

    const stats: Stats = {
      totalViews,
      totalStarts,
      totalCompleted,
    }
    return res.status(200).send({ stats })
  }
  return methodNotAllowed(res)
}

export default handler
