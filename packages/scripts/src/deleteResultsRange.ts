import * as p from "@clack/prompts";
import prisma from "@typebot.io/prisma";

const deleteResultsRange = async () => {
  const typebotId = await p.text({
    message: "Typebot ID?",
  });

  if (!typebotId || typeof typebotId !== "string") {
    console.log("No typebot ID provided");
    return;
  }

  const whereClause = {
    typebotId,
    hasStarted: true,
    isArchived: false,
    createdAt: {
      lt: "2025-09-27T19:35:00.000Z",
      gt: "2025-09-27T18:43:00.000Z",
    },
  };

  const totalResultsToDelete = await prisma.result.count({
    where: whereClause,
  });

  console.log(`Total results to delete: ${totalResultsToDelete}`);

  let deletedCount = 0;

  while (deletedCount < totalResultsToDelete) {
    // Fetch IDs of next batch
    const resultsToDelete = await prisma.result.findMany({
      where: whereClause,
      select: { id: true },
      take: 1000,
      orderBy: {
        createdAt: "desc",
      },
    });

    if (resultsToDelete.length === 0) break;

    // Delete by specific IDs
    const deleted = await prisma.result.deleteMany({
      where: {
        id: {
          in: resultsToDelete.map((r) => r.id),
        },
      },
    });

    deletedCount += deleted.count;
    console.log(`Deleted ${deletedCount} / ${totalResultsToDelete} results...`);
  }
};

deleteResultsRange();
