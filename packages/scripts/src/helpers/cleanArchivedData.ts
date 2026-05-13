import { Prisma } from "@prisma/client";
import prisma from "@typebot.io/prisma/withReadReplica";
import { archiveResults } from "@typebot.io/results/archiveResults";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";

export const cleanArchivedData = async () => {
  console.log("🧹 Starting archived data cleanup...");
  const start = Date.now();
  await deleteArchivedTypebots();
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`✅ Archived data cleanup completed in ${elapsed}s`);
};

const deleteArchivedTypebots = async () => {
  const lastDayTwoMonthsAgo = new Date();
  lastDayTwoMonthsAgo.setMonth(lastDayTwoMonthsAgo.getMonth() - 1);
  lastDayTwoMonthsAgo.setDate(0);
  lastDayTwoMonthsAgo.setHours(0, 0, 0, 0);
  console.log(
    `📅 Cutoff date: ${lastDayTwoMonthsAgo.toISOString().split("T")[0]}`,
  );
  console.log("🔍 Fetching archived typebots...");
  const typebots = await prisma.typebot.findMany({
    where: {
      updatedAt: {
        lte: lastDayTwoMonthsAgo,
      },
      isArchived: true,
    },
    select: { id: true },
  });

  if (typebots.length === 0) {
    console.log("   No archived typebots to delete.");
    return;
  }

  console.log(`🗑️  Found ${typebots.length} archived typebots to delete`);

  const chunkSize = 100;
  const totalChunks = Math.ceil(typebots.length / chunkSize);
  for (let i = 0; i < typebots.length; i += chunkSize) {
    const chunkIndex = Math.floor(i / chunkSize) + 1;
    const chunk = typebots.slice(i, i + chunkSize);
    console.log(
      `   [${chunkIndex}/${totalChunks}] Processing chunk of ${chunk.length} typebots...`,
    );
    const chunkIds = chunk.map((typebot) => typebot.id);
    await deleteResultsFromArchivedTypebotsIfAny(chunk);
    try {
      await prisma.typebot.deleteMany({
        where: { id: { in: chunkIds } },
      });
      console.log(
        `   [${chunkIndex}/${totalChunks}] ✓ Deleted ${i + chunk.length}/${typebots.length} typebots`,
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Expected zero or one element")
      ) {
        console.log(
          `   [${chunkIndex}/${totalChunks}] ⚠️  Duplicate PublicTypebot detected, cleaning up...`,
        );
        await deleteDuplicatePublicTypebots(chunkIds);
        await prisma.typebot.deleteMany({
          where: { id: { in: chunkIds } },
        });
        console.log(
          `   [${chunkIndex}/${totalChunks}] ✓ Deleted ${i + chunk.length}/${typebots.length} typebots (after fix)`,
        );
      } else {
        throw error;
      }
    }
  }
};

const deleteDuplicatePublicTypebots = async (typebotIds: string[]) => {
  if (typebotIds.length === 0) return;
  const result =
    await prisma.$executeRaw`DELETE FROM PublicTypebot WHERE typebotId IN (${Prisma.join(typebotIds)})`;
  console.log(`      Removed ${result} PublicTypebot(s) via raw SQL`);
};

const deleteResultsFromArchivedTypebotsIfAny = async (
  typebotIds: { id: string }[],
) => {
  console.log("   🔎 Checking for typebots with remaining results...");
  const archivedTypebotsWithResults = (await prisma.typebot.findMany({
    where: {
      id: {
        in: typebotIds.map((typebot) => typebot.id),
      },
      isArchived: true,
      results: {
        some: {},
      },
    },
    select: {
      id: true,
      groups: true,
      workspaceId: true,
    },
  })) as Pick<Typebot, "groups" | "id" | "workspaceId">[];
  if (archivedTypebotsWithResults.length === 0) {
    console.log("   No results to archive in this chunk.");
    return;
  }
  console.log(
    `   📦 Archiving results for ${archivedTypebotsWithResults.length} typebots...`,
  );
  for (let i = 0; i < archivedTypebotsWithResults.length; i++) {
    const archivedTypebot = archivedTypebotsWithResults[i]!;
    // @ts-expect-error
    await archiveResults(prisma)({
      typebot: archivedTypebot,
      resultsFilter: {
        typebotId: archivedTypebot.id,
      },
    });
    while (true) {
      const batch = await prisma.$primary().result.findMany({
        where: { typebotId: archivedTypebot.id },
        select: { id: true },
        take: 500,
      });
      if (batch.length === 0) break;
      await prisma.result.deleteMany({
        where: { id: { in: batch.map((r) => r.id) } },
      });
    }
  }
};
