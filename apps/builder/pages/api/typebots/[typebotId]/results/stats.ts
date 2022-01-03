import { Stats } from 'bot-engine'
import { User } from 'db'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { methodNotAllowed } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req })

  if (!session?.user)
    return res.status(401).send({ message: 'Not authenticated' })

  const user = session.user as User
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
      completionRate: Math.round((totalCompleted / totalStarts) * 100),
    }
    return res.status(200).send({ stats })
  }
  return methodNotAllowed(res)
}

export default handler
