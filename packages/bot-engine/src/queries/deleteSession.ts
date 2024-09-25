import prisma from "@typebot.io/prisma";

export const deleteSession = (id: string) =>
  prisma.chatSession.deleteMany({
    where: {
      id,
    },
  });
