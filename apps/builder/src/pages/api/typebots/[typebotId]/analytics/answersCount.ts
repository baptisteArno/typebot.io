import { PublicTypebot } from '@typebot.io/schemas'
import prisma from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed, notAuthenticated } from '@typebot.io/lib/api'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { canReadTypebots } from '@/helpers/databaseRules'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)
  if (req.method === 'GET') {
    const typebotId = req.query.typebotId as string
    const typebot = await prisma.typebot.findFirst({
      where: canReadTypebots(typebotId, user),
      select: { publishedTypebot: true },
    })
    const publishedTypebot =
      typebot?.publishedTypebot as unknown as PublicTypebot
    if (!publishedTypebot) return res.status(404).send({ answersCounts: [] })
    const answersCounts = await prisma.answer.groupBy({
      by: ['groupId'],
      where: {
        groupId: { in: publishedTypebot.groups.map((g) => g.id) },
      },
      _count: { _all: true },
    })
    return res.status(200).send({
      answersCounts: answersCounts.map((answer) => ({
        groupId: answer.groupId,
        totalAnswers: answer._count._all,
      })),
    })
  }
  return methodNotAllowed(res)
}

export default handler
