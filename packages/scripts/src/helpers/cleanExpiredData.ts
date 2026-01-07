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
  // Better Auth uses 'expiresAt' instead of 'expires'
  const { count } = await prisma.session.deleteMany({
    where: {
      expiresAt: {
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
  let totalVerifications;
  do {
    // Better Auth uses 'verification' model with 'expiresAt' and 'id' fields
    const verifications = await prisma.verification.findMany({
      where: {
        expiresAt: {
          lte: threeDaysAgo,
        },
      },
      select: {
        id: true,
      },
      take: 80000,
    });

    totalVerifications = verifications.length;

    console.log(`Deleting ${verifications.length} expired verifications...`);
    const chunkSize = 1000;
    for (let i = 0; i < verifications.length; i += chunkSize) {
      const chunk = verifications.slice(i, i + chunkSize);
      await prisma.verification.deleteMany({
        where: {
          id: {
            in: chunk.map((v) => v.id),
          },
        },
      });
    }
  } while (totalVerifications === 80000);
  console.log("Done!");
};
