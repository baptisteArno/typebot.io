import prisma from '@typebot.io/lib/prisma'

export const removeIsReplyingInChatSession = async (id: string) =>
  prisma.chatSession.updateMany({
    where: { id },
    data: { isReplying: false },
  })
