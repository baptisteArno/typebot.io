import { authenticateUser } from '@/helpers/authenticateUser'
import prisma from '@typebot.io/lib/prisma'
import { ResultWithAnswers } from '@typebot.io/schemas'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from '@typebot.io/lib/api'

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
    const typebot = await prisma.typebot.findFirst({
      where: { id: typebotId },
      select: { workspace: { select: { isQuarantined: true } } },
    })
    if (typebot?.workspace.isQuarantined)
      return res.send({ result: null, hasReachedLimit: true })
    const result = await prisma.result.create({
      data: {
        typebotId,
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
