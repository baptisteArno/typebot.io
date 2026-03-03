import prisma from '@typebot.io/lib/prisma'

export const findLatestTypebotHistory = async ({
  typebotId,
}: {
  typebotId: string
}): Promise<string | undefined> => {
  const history = await prisma.typebotHistory.findFirst({
    where: { typebotId, origin: { in: ['PUBLISH', 'RESTORE'] } },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  })
  return history?.id ?? undefined
}
