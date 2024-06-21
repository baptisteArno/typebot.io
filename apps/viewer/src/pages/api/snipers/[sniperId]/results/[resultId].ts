import prisma from '@sniper.io/lib/prisma'
import { Result } from '@sniper.io/schemas'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from '@sniper.io/lib/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'PATCH') {
    const data = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as Result
    const resultId = req.query.resultId as string
    const result = await prisma.result.updateMany({
      where: { id: resultId },
      data,
    })
    return res.send(result)
  }
  return methodNotAllowed(res)
}

export default handler
