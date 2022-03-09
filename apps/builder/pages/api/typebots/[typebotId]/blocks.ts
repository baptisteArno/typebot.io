import { withSentry } from '@sentry/nextjs'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from 'services/api/utils'
import { methodNotAllowed, notAuthenticated, notFound } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  if (req.method === 'GET') {
    const typebotId = req.query.typebotId as string
    const typebot = await prisma.typebot.findUnique({
      where: { id_ownerId: { id: typebotId, ownerId: user.id } },
    })
    if (!typebot) return notFound(res)
    return res.send({ blocks: typebot.blocks })
  }
  methodNotAllowed(res)
}

export default withSentry(handler)
