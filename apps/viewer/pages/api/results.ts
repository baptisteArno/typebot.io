import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { typebotId } = JSON.parse(req.body)
    const result = await prisma.result.create({
      data: { typebotId },
    })
    return res.send(result)
  }
  return methodNotAllowed(res)
}

export default handler
