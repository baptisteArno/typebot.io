import prisma from '@sniper.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'
import { initMiddleware, methodNotAllowed, notFound } from '@sniper.io/lib/api'

const cors = initMiddleware(Cors())

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)
  if (req.method === 'GET') {
    const sniperId = req.query.sniperId as string
    const sniper = await prisma.publicSniper.findUnique({
      where: { sniperId },
    })
    if (!sniper) return notFound(res)
    return res.send({ sniper })
  }
  methodNotAllowed(res)
}

export default handler
