import { withSentry } from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { canReadTypebot } from 'services/api/dbRules'
import { getAuthenticatedUser } from 'services/api/utils'
import { methodNotAllowed, notAuthenticated, notFound } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser()
  if (!user) return notAuthenticated(res)
  // if (req.method === 'GET') {
  //   const typebotId = req.query.typebotId as string
  //   const typebot = await prisma.typebot.findFirst({
  //     where: canReadTypebot(typebotId, user),
  //   })
  //   if (!typebot) return notFound(res)
  //   return res.send({ blocks: typebot.blocks })
  // }
  methodNotAllowed(res)
}

export default withSentry(handler)
