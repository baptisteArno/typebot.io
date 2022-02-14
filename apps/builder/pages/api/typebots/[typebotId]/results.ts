import { withSentry } from '@sentry/nextjs'
import { User } from 'db'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { isFreePlan } from 'services/user'
import { methodNotAllowed } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req })

  if (!session?.user)
    return res.status(401).send({ message: 'Not authenticated' })

  const user = session.user as User
  if (req.method === 'GET') {
    const typebotId = req.query.typebotId.toString()
    const lastResultId = req.query.lastResultId?.toString()
    const take = parseInt(req.query.limit?.toString())
    const results = await prisma.result.findMany({
      take: isNaN(take) ? undefined : take,
      skip: lastResultId ? 1 : 0,
      cursor: lastResultId
        ? {
            id: lastResultId,
          }
        : undefined,
      where: {
        typebotId,
        typebot: { ownerId: user.id },
        answers: { some: {} },
        isCompleted: isFreePlan(user),
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: { answers: true },
    })
    return res.status(200).send({ results })
  }
  if (req.method === 'DELETE') {
    const typebotId = req.query.typebotId.toString()
    const ids = req.query.ids as string[]
    const results = await prisma.result.deleteMany({
      where: { id: { in: ids }, typebotId, typebot: { ownerId: user.id } },
    })
    return res.status(200).send({ results })
  }
  return methodNotAllowed(res)
}

export default withSentry(handler)
