import { withSentry } from '@sentry/nextjs'
import prisma from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { canReadTypebot } from '@/utils/api/dbRules'
import { getAuthenticatedUser } from '@/features/auth/api'
import { methodNotAllowed, notAuthenticated, notFound } from 'utils/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  if (req.method === 'GET') {
    const typebotId = req.query.typebotId as string
    const typebot = await prisma.typebot.findFirst({
      where: canReadTypebot(typebotId, user),
    })
    if (!typebot) return notFound(res)
    return res.send({ groups: typebot.groups })
  }
  methodNotAllowed(res)
}

export default withSentry(handler)
