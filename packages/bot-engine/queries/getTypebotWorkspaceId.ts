import prisma from '@typebot.io/lib/prisma'

export const getTypebotWorkspaceId = async (typebotId: string) =>
  (
    await prisma.typebot.findUnique({
      where: {
        id: typebotId,
      },
      select: {
        workspaceId: true,
      },
    })
  )?.workspaceId
