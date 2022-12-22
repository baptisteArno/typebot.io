import { authenticateUser } from '@/features/auth/api'
import { checkChatsUsage } from '@/features/usage'
import prisma from '@/lib/prisma'
import { ResultWithAnswers } from 'models'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from 'utils/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const user = await authenticateUser(req)
    if (!user) return res.status(401).json({ message: 'Not authenticated' })
    const typebotId = req.query.typebotId as string
    const limit = Number(req.query.limit)
    const results = (await prisma.result.findMany({
      where: {
        typebot: {
          id: typebotId,
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
    const typebotId = req.query.typebotId as string
    const hasReachedLimit = await checkChatsUsage(typebotId)
    if (hasReachedLimit) return res.send({ result: null, hasReachedLimit })
    const result = await prisma.result.create({
      data: {
        typebotId,
        isCompleted: false,
      },
    })
    res.send({ result })
    return
  }
  methodNotAllowed(res)
}

export default handler
