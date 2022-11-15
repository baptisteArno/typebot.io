import { withSentry } from '@sentry/nextjs'
import prisma from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { canReadTypebot } from '@/utils/api/dbRules'
import { getAuthenticatedUser } from '@/features/auth'
import { methodNotAllowed, notAuthenticated } from 'utils/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  if (req.method === 'GET') {
    const typebotId = req.query.typebotId as string
    const resultId = req.query.resultId as string
    const logs = await prisma.log.findMany({
      where: {
        result: { id: resultId, typebot: canReadTypebot(typebotId, user) },
      },
    })
    return res.send({ logs })
  }
  methodNotAllowed(res)
}

export default withSentry(handler)
