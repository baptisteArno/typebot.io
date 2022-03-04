import { PublicTypebot } from 'models'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed, notAuthenticated } from 'utils'
import { withSentry } from '@sentry/nextjs'
import { getAuthenticatedUser } from 'services/api/utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  if (req.method === 'GET') {
    const typebotId = req.query.typebotId.toString()
    const typebot = await prisma.typebot.findUnique({
      where: { id: typebotId },
      include: { publishedTypebot: true },
    })
    if (!typebot) return res.status(404).send({ answersCounts: [] })
    if (typebot?.ownerId !== user.id)
      return res.status(403).send({ message: 'Forbidden' })

    const answersCounts: { blockId: string; totalAnswers: number }[] =
      await Promise.all(
        (typebot.publishedTypebot as unknown as PublicTypebot).blocks.map(
          async (block) => {
            const totalAnswers = await prisma.answer.count({
              where: { blockId: block.id },
            })
            return { blockId: block.id, totalAnswers }
          }
        )
      )
    return res.status(200).send({ answersCounts })
  }
  return methodNotAllowed(res)
}

export default withSentry(handler)
