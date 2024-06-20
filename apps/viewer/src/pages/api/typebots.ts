import { authenticateUser } from '@/helpers/authenticateUser'
import prisma from '@sniper.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from '@sniper.io/lib/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const user = await authenticateUser(req)
    if (!user) return res.status(401).json({ message: 'Not authenticated' })
    const snipers = await prisma.sniper.findMany({
      where: {
        workspace: { members: { some: { userId: user.id } } },
        isArchived: { not: true },
      },
      select: {
        name: true,
        publishedSniper: { select: { id: true } },
        id: true,
      },
    })
    return res.send({
      snipers: snipers.map((sniper) => ({
        id: sniper.id,
        name: sniper.name,
        publishedSniperId: sniper.publishedSniper?.id,
      })),
    })
  }
  return methodNotAllowed(res)
}

export default handler
