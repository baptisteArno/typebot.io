import { authenticateUser } from '@/helpers/authenticateUser'
import prisma from '@sniper.io/lib/prisma'
import { ResultWithAnswers } from '@sniper.io/schemas'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from '@sniper.io/lib/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const user = await authenticateUser(req)
    if (!user) return res.status(401).json({ message: 'Not authenticated' })
    const sniperId = req.query.sniperId as string
    const limit = Number(req.query.limit)
    const results = (await prisma.result.findMany({
      where: {
        sniper: {
          id: sniperId,
          workspace: { members: { some: { userId: user.id } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { answers: true },
    })) as unknown as ResultWithAnswers[]
    return res.send({ results })
  }
  if (req.method === 'POST') {
    const sniperId = req.query.sniperId as string
    const sniper = await prisma.sniper.findFirst({
      where: { id: sniperId },
      select: { workspace: { select: { isQuarantined: true } } },
    })
    if (sniper?.workspace.isQuarantined)
      return res.send({ result: null, hasReachedLimit: true })
    const result = await prisma.result.create({
      data: {
        sniperId,
        isCompleted: false,
        variables: [],
      },
    })
    res.send({ result })
    return
  }
  methodNotAllowed(res)
}

export default handler
