import { withSentry } from '@sentry/nextjs'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from 'services/api/utils'
import { methodNotAllowed, notAuthenticated } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const user = await getAuthenticatedUser(req)
    if (!user) return notAuthenticated(res)
    const isCountOnly = req.query.count as string | undefined
    if (isCountOnly) {
      const count = await prisma.collaboratorsOnTypebots.count({
        where: { userId: user.id },
      })
      return res.send({ count })
    }
    const sharedTypebots = await prisma.collaboratorsOnTypebots.findMany({
      where: { userId: user.id },
      include: {
        typebot: {
          select: {
            name: true,
            publishedTypebotId: true,
            id: true,
            icon: true,
          },
        },
      },
    })
    return res.send({
      sharedTypebots: sharedTypebots.map((typebot) => ({ ...typebot.typebot })),
    })
  }
  methodNotAllowed(res)
}

export default withSentry(handler)
