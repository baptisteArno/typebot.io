import { authenticateUser } from '@/helpers/authenticateUser'
import prisma from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from '@typebot.io/lib/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const user = await authenticateUser(req)
    if (!user) return res.status(401).json({ message: 'Not authenticated' })
    const typebots = await prisma.typebot.findMany({
      where: { workspace: { members: { some: { userId: user.id } } } },
      select: {
        name: true,
        publishedTypebot: { select: { id: true } },
        id: true,
      },
    })
    return res.send({
      typebots: typebots.map((typebot) => ({
        id: typebot.id,
        name: typebot.name,
        publishedTypebotId: typebot.publishedTypebot?.id,
      })),
    })
  }
  return methodNotAllowed(res)
}

export default handler
