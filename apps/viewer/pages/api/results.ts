import { withSentry } from '@sentry/nextjs'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { typebotId } = JSON.parse(req.body) as { typebotId: string }
    const result = await prisma.result.create({
      data: { typebotId, isCompleted: false },
    })
    return res.send(result)
  }
  return methodNotAllowed(res)
}

export default withSentry(handler)
