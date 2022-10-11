import { withSentry } from '@sentry/nextjs'
import { Answer } from 'db'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'PUT') {
    const answer = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as Answer
    // const result = await prisma.answer.upsert({
    //   where: {
    //     resultId_blockId_stepId: {
    //       resultId: answer.resultId,
    //       blockId: answer.blockId,
    //       stepId: answer.stepId,
    //     },
    //   },
    //   create: answer,
    //   update: answer,
    // })
    // return res.send(result)

    return res.send({})
  }
  return methodNotAllowed(res)
}

export default withSentry(handler)
