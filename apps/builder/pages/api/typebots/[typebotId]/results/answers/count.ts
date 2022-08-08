import { PublicTypebot } from 'models'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed, notAuthenticated } from 'utils'
import { withSentry } from '@sentry/nextjs'
import { getAuthenticatedUser } from 'services/api/utils'
import { canReadTypebot } from 'services/api/dbRules'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  if (req.method === 'GET') {
    const typebotId = req.query.typebotId as string
    const typebot = await prisma.typebot.findFirst({
      where: canReadTypebot(typebotId, user),
      include: { publishedTypebot: true },
    })
    if (!typebot) return res.status(404).send({ answersCounts: [] })
    const answersCounts: { groupId: string; totalAnswers: number }[] =
      await Promise.all(
        (typebot.publishedTypebot as unknown as PublicTypebot).groups.map(
          async (block) => {
            const totalAnswers = await prisma.answer.count({
              where: { groupId: block.id },
            })
            return { groupId: block.id, totalAnswers }
          }
        )
      )
    return res.status(200).send({ answersCounts })
  }
  return methodNotAllowed(res)
}

export default withSentry(handler)
