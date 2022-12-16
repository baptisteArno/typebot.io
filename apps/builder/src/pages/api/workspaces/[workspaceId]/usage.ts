import prisma from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/features/auth/api'
import { methodNotAllowed, notAuthenticated } from 'utils/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  if (req.method === 'GET') {
    const workspaceId = req.query.workspaceId as string
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDayOfNextMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1
    )
    const totalChatsUsed = await prisma.$transaction(async (tx) => {
      const typebots = await tx.typebot.findMany({
        where: {
          workspace: {
            id: workspaceId,
            members: { some: { userId: user.id } },
          },
        },
      })
      return tx.result.count({
        where: {
          typebotId: { in: typebots.map((typebot) => typebot.id) },
          hasStarted: true,
          createdAt: {
            gte: firstDayOfMonth,
            lt: firstDayOfNextMonth,
          },
        },
      })
    })
    const {
      _sum: { storageUsed: totalStorageUsed },
    } = await prisma.answer.aggregate({
      where: {
        storageUsed: { gt: 0 },
        result: {
          typebot: {
            workspace: {
              id: workspaceId,
              members: { some: { userId: user.id } },
            },
          },
        },
      },
      _sum: { storageUsed: true },
    })
    return res.send({
      totalChatsUsed,
      totalStorageUsed,
    })
  }
  methodNotAllowed(res)
}

export default handler
