import { PrismaClient } from '@typebot.io/prisma'

export const getUsage =
  (prisma: PrismaClient) => async (workspaceId: string) => {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDayOfNextMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1
    )
    const typebots = await prisma.typebot.findMany({
      where: {
        workspace: {
          id: workspaceId,
        },
      },
      select: { id: true },
    })

    const [
      totalChatsUsed,
      {
        _sum: { storageUsed: totalStorageUsed },
      },
    ] = await Promise.all([
      prisma.result.count({
        where: {
          typebotId: { in: typebots.map((typebot) => typebot.id) },
          hasStarted: true,
          createdAt: {
            gte: firstDayOfMonth,
            lt: firstDayOfNextMonth,
          },
        },
      }),
      prisma.answer.aggregate({
        where: {
          storageUsed: { gt: 0 },
          result: {
            typebotId: { in: typebots.map((typebot) => typebot.id) },
          },
        },
        _sum: { storageUsed: true },
      }),
    ])

    return {
      totalChatsUsed,
      totalStorageUsed: totalStorageUsed ?? 0,
    }
  }
