import { withSentry } from '@sentry/nextjs'
import prisma from 'libs/prisma'
import { Result } from 'models'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'PATCH') {
    const data = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as Result
    const resultId = req.query.resultId as string
    const result = await prisma.result.update({
      where: { id: resultId },
      data,
    })
    return res.send(result)
  }
  return methodNotAllowed(res)
}

export default withSentry(handler)
