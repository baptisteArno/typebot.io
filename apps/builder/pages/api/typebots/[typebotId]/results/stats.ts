import { withSentry } from '@sentry/nextjs'
import prisma from 'libs/prisma'
import { Stats } from 'models'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from 'services/api/utils'
import { methodNotAllowed, notAuthenticated } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  if (req.method === 'GET') {
    const typebotId = req.query.typebotId.toString()

    const totalViews = await prisma.result.count({
      where: {
        typebotId,
        typebot: { ownerId: user.id },
      },
    })
    const totalStarts = await prisma.result.count({
      where: {
        typebotId,
        typebot: { ownerId: user.id },
        answers: { some: {} },
      },
    })
    const totalCompleted = await prisma.result.count({
      where: {
        typebotId,
        typebot: { ownerId: user.id },
        isCompleted: true,
      },
    })
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
