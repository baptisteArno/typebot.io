import { PublicTypebot } from 'models'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed, notAuthenticated } from 'utils'
import { withSentry } from '@sentry/nextjs'
import { getAuthenticatedUser } from 'services/api/utils'
import { canReadTypebot } from 'services/api/dbRules'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser()
  if (!user) return notAuthenticated(res)
  // if (req.method === 'GET') {
  //   const typebotId = req.query.typebotId.toString()
  //   const typebot = await prisma.typebot.findFirst({
  //     where: canReadTypebot(typebotId, user),
  //     include: { publishedTypebot: true },
  //   })
  //   if (!typebot) return res.status(404).send({ answersCounts: [] })
  //   const answersCounts: { blockId: string; totalAnswers: number }[] =
  //     await Promise.all(
  //       (typebot.publishedTypebot as unknown as PublicTypebot).blocks.map(
  //         async (block) => {
  //           const totalAnswers = await prisma.answer.count({
  //             where: { blockId: block.id },
  //           })
  //           return { blockId: block.id, totalAnswers }
  //         }
  //       )
  //     )
  //   return res.status(200).send({ answersCounts })
  // }
  return methodNotAllowed(res)
}

export default withSentry(handler)
