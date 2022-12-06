import { withSentry } from '@sentry/nextjs'
import prisma from '@/lib/prisma'
import { Stats } from 'models'
import { NextApiRequest, NextApiResponse } from 'next'
import { canReadTypebot } from '@/utils/api/dbRules'
import { getAuthenticatedUser } from '@/features/auth/api'
import { methodNotAllowed, notAuthenticated } from 'utils/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  if (req.method === 'GET') {
    const typebotId = req.query.typebotId as string

    const [totalViews, totalStarts, totalCompleted] = await prisma.$transaction(
      [
        prisma.result.count({
          where: {
            typebot: canReadTypebot(typebotId, user),
          },
        }),
        prisma.result.count({
          where: {
            typebot: canReadTypebot(typebotId, user),
            hasStarted: true,
          },
        }),
        prisma.result.count({
          where: {
            typebot: canReadTypebot(typebotId, user),
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

export default withSentry(handler)
