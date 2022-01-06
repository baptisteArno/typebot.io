import { PublicTypebot } from 'models'
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
    const typebot = await prisma.typebot.findUnique({
      where: { id: typebotId },
      include: { publishedTypebot: true },
    })
    if (!typebot) return res.status(404).send({ answersCounts: [] })
    if (typebot?.ownerId !== user.id)
      return res.status(403).send({ message: 'Forbidden' })

    const answersCounts: { blockId: string; totalAnswers: number }[] =
      await Promise.all(
        (
          typebot.publishedTypebot as unknown as PublicTypebot
        ).blocks.allIds.map(async (blockId) => {
          const totalAnswers = await prisma.answer.count({
            where: { blockId },
          })
          return { blockId, totalAnswers }
        })
      )
    return res.status(200).send({ answersCounts })
  }
  return methodNotAllowed(res)
}

export default handler
