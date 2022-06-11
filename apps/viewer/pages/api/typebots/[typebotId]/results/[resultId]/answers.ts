import { withSentry } from '@sentry/nextjs'
import { Answer } from 'db'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'PUT') {
    const answer = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as Answer
    const result = await prisma.answer.upsert({
      where: {
        resultId_blockId_groupId: {
          resultId: answer.resultId,
          groupId: answer.groupId,
          blockId: answer.blockId,
        },
      },
      create: answer,
      update: answer,
    })
    return res.send(result)
  }
  return methodNotAllowed(res)
}

export default withSentry(handler)
