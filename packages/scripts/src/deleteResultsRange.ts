import prisma from "@typebot.io/prisma";
import {
  assertProductionEnvironment,
  confirmAction,
  getRequiredInput,
  runScript,
} from "./cli";

const deleteResultsRange = async () => {
  assertProductionEnvironment();
  const typebotId = await getRequiredInput({
    message: "Typebot ID?",
    name: "typebot-id",
  });
  const from = await getRequiredInput({
    message: "Start date (ISO 8601, exclusive)?",
    name: "from",
    validate: validateDate,
  });
  const to = await getRequiredInput({
    message: "End date (ISO 8601, exclusive)?",
    name: "to",
    validate: validateDate,
  });
  if (Date.parse(from) >= Date.parse(to))
    throw new Error("--from must be earlier than --to");

  const whereClause = {
    typebotId,
    hasStarted: true,
    isArchived: false,
    createdAt: {
      lt: to,
      gt: from,
    },
  };

  const totalResultsToDelete = await prisma.result.count({
    where: whereClause,
  });

  console.log(`Total results to delete: ${totalResultsToDelete}`);

  if (
    !(await confirmAction({
      message: `Delete these ${totalResultsToDelete} production results?`,
    }))
  )
    return;

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

const validateDate = (value: string) =>
  Number.isNaN(Date.parse(value)) ? "Expected an ISO 8601 date" : undefined;

runScript(deleteResultsRange);
