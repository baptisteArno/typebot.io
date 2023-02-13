import prisma from '@/lib/prisma'
import { Stats } from 'models'
import { NextApiRequest, NextApiResponse } from 'next'
import { canReadTypebots } from '@/utils/api/dbRules'
import { getAuthenticatedUser } from '@/features/auth/api'
import { methodNotAllowed, notAuthenticated } from 'utils/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  if (req.method === 'GET') {
    const typebotId = req.query.typebotId as string

    const typebot = await prisma.typebot.findFirst({
      where: canReadTypebots(typebotId, user),
      select: { id: true },
    })

    if (!typebot) return res.status(404).send({ message: 'Typebot not found' })

    const [totalViews, totalStarts, totalCompleted] = await prisma.$transaction(
      [
        prisma.result.count({
          where: {
            typebotId: typebot.id,
            isArchived: false,
          },
        }),
        prisma.result.count({
          where: {
            typebotId: typebot.id,
            isArchived: false,
            hasStarted: true,
          },
        }),
        prisma.result.count({
          where: {
            typebotId: typebot.id,
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
