import { withSentry } from '@sentry/nextjs'
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
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const totalChatsUsed = await prisma.result.count({
      where: {
        typebot: {
          workspace: {
            id: workspaceId,
            members: { some: { userId: user.id } },
          },
        },
        hasStarted: true,
        createdAt: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
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

export default withSentry(handler)
