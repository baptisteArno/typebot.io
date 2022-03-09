import { withSentry } from '@sentry/nextjs'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed, notFound } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const typebotId = req.query.typebotId as string
    const typebot = await prisma.publicTypebot.findUnique({
      where: { typebotId },
    })
    if (!typebot) return notFound(res)
    return res.send({ typebot })
  }
  methodNotAllowed(res)
}

export default withSentry(handler)
