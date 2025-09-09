import prisma from "@typebot.io/prisma/withReadReplica";
import { archiveResults } from "@typebot.io/results/archiveResults";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";

export const cleanArchivedData = async () => {
  await deleteArchivedResults();
  await deleteArchivedTypebots();
};

const deleteArchivedTypebots = async () => {
  const lastDayTwoMonthsAgo = new Date();
  lastDayTwoMonthsAgo.setMonth(lastDayTwoMonthsAgo.getMonth() - 1);
  lastDayTwoMonthsAgo.setDate(0);
  lastDayTwoMonthsAgo.setHours(0, 0, 0, 0);
  console.log(`Fetching archived typebots...`);
  const typebots = await prisma.typebot.findMany({
    where: {
      updatedAt: {
        lte: lastDayTwoMonthsAgo,
      },
      isArchived: true,
    },
    select: { id: true },
  });

  console.log(`Deleting ${typebots.length} archived typebots...`);

  const chunkSize = 1000;
  for (let i = 0; i < typebots.length; i += chunkSize) {
    const chunk = typebots.slice(i, i + chunkSize);
    await deleteResultsFromArchivedTypebotsIfAny(chunk);
    await prisma.typebot.deleteMany({
      where: {
        id: {
          in: chunk.map((typebot) => typebot.id),
        },
      },
    });
  }
  console.log("Done!");
};

const deleteArchivedResults = async () => {
  const resultsBatch = 10000;
  const lastDayTwoMonthsAgo = new Date();
  lastDayTwoMonthsAgo.setMonth(lastDayTwoMonthsAgo.getMonth() - 1);
  lastDayTwoMonthsAgo.setDate(0);
  lastDayTwoMonthsAgo.setHours(0, 0, 0, 0);
  let totalResults;
  do {
    console.log(`Fetching ${resultsBatch} archived results...`);
    const results = (await prisma.$queryRaw`
      SELECT id
      FROM Result
      WHERE createdAt <= ${lastDayTwoMonthsAgo}
        AND isArchived = true
      LIMIT ${resultsBatch}
    `) as { id: string }[];
    totalResults = results.length;
    console.log(`Deleting ${results.length} archived results...`);
    const chunkSize = 1000;
    for (let i = 0; i < results.length; i += chunkSize) {
      const chunk = results.slice(i, i + chunkSize);
      await prisma.result.deleteMany({
        where: {
          id: {
            in: chunk.map((result) => result.id),
          },
        },
      });
    }
  } while (totalResults === resultsBatch);

  console.log("Done!");
};

const deleteResultsFromArchivedTypebotsIfAny = async (
  typebotIds: { id: string }[],
) => {
  console.log("Checking for archived typebots with non-archived results...");
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
  if (archivedTypebotsWithResults.length === 0) return;
  console.log(
    `Found ${archivedTypebotsWithResults.length} archived typebots with non-archived results.`,
  );
  for (const archivedTypebot of archivedTypebotsWithResults) {
    // @ts-expect-error
    await archiveResults(prisma)({
      typebot: archivedTypebot,
      resultsFilter: {
        typebotId: archivedTypebot.id,
      },
    });
  }
  console.log("Delete archived results...");
  await deleteArchivedResults();
};
