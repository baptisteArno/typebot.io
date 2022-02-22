import prisma from 'libs/prisma'
import { ResultWithAnswers, Typebot } from 'models'
import { NextApiRequest, NextApiResponse } from 'next'
import { authenticateUser } from 'services/api/utils'
import { methodNotAllowed, parseAnswers } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const user = await authenticateUser(req)
    if (!user) return res.status(401).json({ message: 'Not authenticated' })
    const typebotId = req.query.typebotId.toString()
    const typebot = await prisma.typebot.findUnique({
      where: { id_ownerId: { id: typebotId, ownerId: user.id } },
    })
    if (!typebot) return res.status(400).send({ message: 'Typebot not found' })
    const limit = Number(req.query.limit)
    const results = (await prisma.result.findMany({
      where: { typebotId: typebot.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { answers: true },
    })) as unknown as ResultWithAnswers[]
    res.send({
      results: results.map(parseAnswers(typebot as unknown as Typebot)),
    })
  }
  methodNotAllowed(res)
}

export default handler
