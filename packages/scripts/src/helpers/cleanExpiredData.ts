import prisma from "@typebot.io/prisma/withReadReplica";

export const cleanExpiredData = async () => {
  const { totalDeletedChatSessions } = await deleteOldChatSessions();
  await deleteExpiredAppSessions();
  await deleteExpiredVerificationTokens();
  return { totalDeletedChatSessions };
};

const deleteOldChatSessions = async () => {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  twoDaysAgo.setHours(0, 0, 0, 0);
  let totalDeletedChatSessions = 0;
  let deletingChatSessions;
  do {
    const chatSessions = await prisma.chatSession.findMany({
      where: {
        updatedAt: {
          lte: twoDaysAgo,
        },
      },
      select: {
        id: true,
      },
      take: 80000,
    });

    deletingChatSessions = chatSessions.length;
    totalDeletedChatSessions += deletingChatSessions;

    const chunkSize = 500;
    for (let i = 0; i < chatSessions.length; i += chunkSize) {
      console.log(`Deleting ${i}/${deletingChatSessions} chat sessions...`);
      const chunk = chatSessions.slice(i, i + chunkSize);
      await prisma.chatSession.deleteMany({
        where: {
          id: {
            in: chunk.map((chatSession) => chatSession.id),
          },
        },
      });
    }
  } while (deletingChatSessions === 80000);
  return { totalDeletedChatSessions };
};

const deleteExpiredAppSessions = async () => {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  threeDaysAgo.setHours(0, 0, 0, 0);
  const { count } = await prisma.session.deleteMany({
    where: {
      expires: {
        lte: threeDaysAgo,
      },
    },
  });
  console.log(`Deleted ${count} expired user sessions.`);
};

const deleteExpiredVerificationTokens = async () => {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  threeDaysAgo.setHours(0, 0, 0, 0);
  let totalVerificationTokens;
  do {
    const verificationTokens = await prisma.verificationToken.findMany({
      where: {
        expires: {
          lte: threeDaysAgo,
        },
      },
      select: {
        token: true,
      },
      take: 80000,
    });

    totalVerificationTokens = verificationTokens.length;

    console.log(`Deleting ${verificationTokens.length} expired tokens...`);
    const chunkSize = 1000;
    for (let i = 0; i < verificationTokens.length; i += chunkSize) {
      const chunk = verificationTokens.slice(i, i + chunkSize);
      await prisma.verificationToken.deleteMany({
        where: {
          token: {
            in: chunk.map((verificationToken) => verificationToken.token),
          },
        },
      });
    }
  } while (totalVerificationTokens === 80000);
  console.log("Done!");
};
