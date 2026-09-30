import prisma from "@typebot.io/prisma/withReadReplica";
import { Effect } from "effect";
import { deleteRecordsInBatches } from "./deleteRecordsInBatches";

export const cleanExpiredData = async (cleanupDate = new Date()) => {
  console.log("[cleanExpiredData] Starting expired data cleanup...");
  const startedAt = Date.now();
  const totalDeletedChatSessions = await deleteOldChatSessions(cleanupDate);
  const totalDeletedAppSessions = await deleteExpiredAppSessions(cleanupDate);
  const totalDeletedVerificationTokens =
    await deleteExpiredVerificationTokens(cleanupDate);
  console.log(
    `[cleanExpiredData] Finished expired data cleanup in ${formatElapsedTime(startedAt)}.`,
  );
  return {
    totalDeletedChatSessions,
    totalDeletedAppSessions,
    totalDeletedVerificationTokens,
  };
};

const CHAT_SESSIONS_BATCH_SIZE = 80000;
const deleteOldChatSessions = async (cleanupDate: Date) => {
  const twoDaysAgo = getExpirationCutoff(cleanupDate, 2);
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
    console.log(
      `[cleanExpiredData] Chat sessions batch ${batchNumber}: fetched ${deletingChatSessions} records in ${formatElapsedTime(fetchStartedAt)}.`,
    );

    totalDeletedChatSessions += await Effect.runPromise(
      deleteRecordsInBatches({
        recordIds: chatSessions.map((chatSession) => chatSession.id),
        label: `Chat sessions batch ${batchNumber}`,
        deleteRecords: (recordIds) =>
          prisma.chatSession.deleteMany({
            where: {
              id: {
                in: recordIds,
              },
              updatedAt: { lte: twoDaysAgo },
            },
          }),
      }),
    );
  } while (deletingChatSessions === CHAT_SESSIONS_BATCH_SIZE);
  console.log(
    `[cleanExpiredData] Deleted ${totalDeletedChatSessions} old chat sessions.`,
  );
  return totalDeletedChatSessions;
};

const deleteExpiredAppSessions = async (cleanupDate: Date) => {
  const threeDaysAgo = getExpirationCutoff(cleanupDate, 3);
  console.log(
    `[cleanExpiredData] Deleting app sessions expiring before ${threeDaysAgo.toISOString()}...`,
  );
  const startedAt = Date.now();
  let totalDeletedAppSessions = 0;
  let fetchedSessions: number;
  do {
    const sessions = await prisma.$primary().session.findMany({
      where: { expires: { lte: threeDaysAgo } },
      select: { id: true },
      take: CHAT_SESSIONS_BATCH_SIZE,
    });
    fetchedSessions = sessions.length;
    totalDeletedAppSessions += await Effect.runPromise(
      deleteRecordsInBatches({
        recordIds: sessions.map((session) => session.id),
        label: "Expired app sessions",
        deleteRecords: (recordIds) =>
          prisma.session.deleteMany({
            where: { id: { in: recordIds }, expires: { lte: threeDaysAgo } },
          }),
      }),
    ).catch((error) => {
      logCleanupError(
        `[cleanExpiredData] Expired app sessions delete failed after ${formatElapsedTime(startedAt)}.`,
        error,
      );
      throw error;
    });
  } while (fetchedSessions === CHAT_SESSIONS_BATCH_SIZE);
  console.log(
    `[cleanExpiredData] Deleted ${totalDeletedAppSessions} expired user sessions in ${formatElapsedTime(startedAt)}.`,
  );
  return totalDeletedAppSessions;
};

const deleteExpiredVerificationTokens = async (cleanupDate: Date) => {
  const threeDaysAgo = getExpirationCutoff(cleanupDate, 3);
  let totalVerificationTokens: number;
  let totalDeletedVerificationTokens = 0;
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
    const verificationTokens = await prisma
      .$primary()
      .verificationToken.findMany({
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
    totalDeletedVerificationTokens += await Effect.runPromise(
      deleteRecordsInBatches({
        recordIds: verificationTokens.map(
          (verificationToken) => verificationToken.token,
        ),
        label: `Verification tokens batch ${batchNumber}`,
        deleteRecords: (recordIds) =>
          prisma.verificationToken.deleteMany({
            where: {
              token: {
                in: recordIds,
              },
              expires: { lte: threeDaysAgo },
            },
          }),
      }),
    );
  } while (totalVerificationTokens === 80000);
  console.log("[cleanExpiredData] Done deleting expired verification tokens.");
  return totalDeletedVerificationTokens;
};

const getExpirationCutoff = (cleanupDate: Date, daysAgo: number) => {
  const expirationCutoff = new Date(cleanupDate);
  expirationCutoff.setUTCDate(expirationCutoff.getUTCDate() - daysAgo);
  expirationCutoff.setUTCHours(0, 0, 0, 0);
  return expirationCutoff;
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
