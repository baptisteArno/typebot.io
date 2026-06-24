import prisma from "@typebot.io/prisma/withReadReplica";

export const cleanExpiredData = async () => {
  console.log("[cleanExpiredData] Starting expired data cleanup...");
  const startedAt = Date.now();
  const { totalDeletedChatSessions } = await deleteOldChatSessions();
  await deleteExpiredAppSessions();
  await deleteExpiredVerificationTokens();
  console.log(
    `[cleanExpiredData] Finished expired data cleanup in ${formatElapsedTime(startedAt)}.`,
  );
  return { totalDeletedChatSessions };
};

const CHAT_SESSIONS_BATCH_SIZE = 80000;
const CHAT_SESSIONS_DELETE_CHUNK_SIZE = 400;
const deleteOldChatSessions = async () => {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  twoDaysAgo.setHours(0, 0, 0, 0);
  let totalDeletedChatSessions = 0;
  let deletingChatSessions: number;
  let batchNumber = 0;
  console.log(
    `[cleanExpiredData] Looking for chat sessions updated before ${twoDaysAgo.toISOString()}.`,
  );
  do {
    batchNumber += 1;
    console.log(
      `[cleanExpiredData] Chat sessions batch ${batchNumber}: fetching up to ${CHAT_SESSIONS_BATCH_SIZE} records from primary...`,
    );
    const fetchStartedAt = Date.now();
    const chatSessions = await prisma
      .$primary()
      .chatSession.findMany({
        where: {
          updatedAt: {
            lte: twoDaysAgo,
          },
        },
        select: {
          id: true,
        },
        take: CHAT_SESSIONS_BATCH_SIZE,
      })
      .catch((error) => {
        logCleanupError(
          `[cleanExpiredData] Chat sessions batch ${batchNumber}: fetch failed after ${formatElapsedTime(fetchStartedAt)}.`,
          error,
        );
        throw error;
      });

    deletingChatSessions = chatSessions.length;
    totalDeletedChatSessions += deletingChatSessions;
    console.log(
      `[cleanExpiredData] Chat sessions batch ${batchNumber}: fetched ${deletingChatSessions} records in ${formatElapsedTime(fetchStartedAt)}.`,
    );

    const totalChunks = Math.ceil(
      chatSessions.length / CHAT_SESSIONS_DELETE_CHUNK_SIZE,
    );
    for (
      let i = 0;
      i < chatSessions.length;
      i += CHAT_SESSIONS_DELETE_CHUNK_SIZE
    ) {
      const chunk = chatSessions.slice(i, i + CHAT_SESSIONS_DELETE_CHUNK_SIZE);
      const chunkNumber = Math.floor(i / CHAT_SESSIONS_DELETE_CHUNK_SIZE) + 1;
      const deleteStartedAt = Date.now();
      console.log(
        `[cleanExpiredData] Chat sessions batch ${batchNumber}: deleting chunk ${chunkNumber}/${totalChunks} (${chunk.length} records, offset ${i})...`,
      );
      const { count } = await prisma.chatSession
        .deleteMany({
          where: {
            id: {
              in: chunk.map((chatSession) => chatSession.id),
            },
          },
        })
        .catch((error) => {
          logCleanupError(
            `[cleanExpiredData] Chat sessions batch ${batchNumber}: delete chunk ${chunkNumber}/${totalChunks} failed after ${formatElapsedTime(deleteStartedAt)} (${chunk.length} records, offset ${i}).`,
            error,
          );
          throw error;
        });
      console.log(
        `[cleanExpiredData] Chat sessions batch ${batchNumber}: deleted ${count}/${chunk.length} records from chunk ${chunkNumber}/${totalChunks} in ${formatElapsedTime(deleteStartedAt)}.`,
      );
    }
  } while (deletingChatSessions === CHAT_SESSIONS_BATCH_SIZE);
  console.log(
    `[cleanExpiredData] Deleted ${totalDeletedChatSessions} old chat sessions.`,
  );
  return { totalDeletedChatSessions };
};

const deleteExpiredAppSessions = async () => {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  threeDaysAgo.setHours(0, 0, 0, 0);
  console.log(
    `[cleanExpiredData] Deleting app sessions expiring before ${threeDaysAgo.toISOString()}...`,
  );
  const startedAt = Date.now();
  const { count } = await prisma.session
    .deleteMany({
      where: {
        expires: {
          lte: threeDaysAgo,
        },
      },
    })
    .catch((error) => {
      logCleanupError(
        `[cleanExpiredData] Expired app sessions delete failed after ${formatElapsedTime(startedAt)}.`,
        error,
      );
      throw error;
    });
  console.log(
    `[cleanExpiredData] Deleted ${count} expired user sessions in ${formatElapsedTime(startedAt)}.`,
  );
};

const deleteExpiredVerificationTokens = async () => {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  threeDaysAgo.setHours(0, 0, 0, 0);
  let totalVerificationTokens: number;
  let batchNumber = 0;
  console.log(
    `[cleanExpiredData] Looking for verification tokens expiring before ${threeDaysAgo.toISOString()}.`,
  );
  do {
    batchNumber += 1;
    const fetchStartedAt = Date.now();
    console.log(
      `[cleanExpiredData] Verification tokens batch ${batchNumber}: fetching up to 80000 records...`,
    );
    const verificationTokens = await prisma.verificationToken
      .findMany({
        where: {
          expires: {
            lte: threeDaysAgo,
          },
        },
        select: {
          token: true,
        },
        take: 80000,
      })
      .catch((error) => {
        logCleanupError(
          `[cleanExpiredData] Verification tokens batch ${batchNumber}: fetch failed after ${formatElapsedTime(fetchStartedAt)}.`,
          error,
        );
        throw error;
      });

    totalVerificationTokens = verificationTokens.length;

    console.log(
      `[cleanExpiredData] Verification tokens batch ${batchNumber}: fetched ${verificationTokens.length} records in ${formatElapsedTime(fetchStartedAt)}.`,
    );
    const chunkSize = 1000;
    const totalChunks = Math.ceil(verificationTokens.length / chunkSize);
    for (let i = 0; i < verificationTokens.length; i += chunkSize) {
      const chunk = verificationTokens.slice(i, i + chunkSize);
      const chunkNumber = Math.floor(i / chunkSize) + 1;
      const deleteStartedAt = Date.now();
      console.log(
        `[cleanExpiredData] Verification tokens batch ${batchNumber}: deleting chunk ${chunkNumber}/${totalChunks} (${chunk.length} records, offset ${i})...`,
      );
      const { count } = await prisma.verificationToken
        .deleteMany({
          where: {
            token: {
              in: chunk.map((verificationToken) => verificationToken.token),
            },
          },
        })
        .catch((error) => {
          logCleanupError(
            `[cleanExpiredData] Verification tokens batch ${batchNumber}: delete chunk ${chunkNumber}/${totalChunks} failed after ${formatElapsedTime(deleteStartedAt)} (${chunk.length} records, offset ${i}).`,
            error,
          );
          throw error;
        });
      console.log(
        `[cleanExpiredData] Verification tokens batch ${batchNumber}: deleted ${count}/${chunk.length} records from chunk ${chunkNumber}/${totalChunks} in ${formatElapsedTime(deleteStartedAt)}.`,
      );
    }
  } while (totalVerificationTokens === 80000);
  console.log("[cleanExpiredData] Done deleting expired verification tokens.");
};

const formatElapsedTime = (startedAt: number) =>
  `${((Date.now() - startedAt) / 1000).toFixed(1)}s`;

const logCleanupError = (message: string, error: unknown) => {
  console.error(message);
  if (error instanceof Error) {
    console.error(`[cleanExpiredData] Error name: ${error.name}`);
    console.error(`[cleanExpiredData] Error message: ${error.message}`);
    console.error(`[cleanExpiredData] Error stack: ${error.stack}`);
  }
  if (typeof error === "object" && error !== null && "status" in error) {
    console.error("[cleanExpiredData] Error status:", error.status);
  }
  if (typeof error === "object" && error !== null && "body" in error) {
    console.error("[cleanExpiredData] Error body:", error.body);
  }
};
