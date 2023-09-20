import prisma from '@typebot.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'
import { initMiddleware, methodNotAllowed, notFound } from '@typebot.io/lib/api'

const cors = initMiddleware(Cors())

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)
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

export default handler
