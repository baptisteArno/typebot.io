import prisma from "@typebot.io/prisma/withReadReplica";
import type { TelemetryEvent } from "@typebot.io/telemetry/schemas";

export const trackAndReportYesterdaysResults = async () => {
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const yesterdayMidnight = new Date();
  yesterdayMidnight.setHours(0, 0, 0, 0);

  const recentWorkspaces = await prisma.workspace.findMany({
    where: {
      lastActivityAt: {
        gte: yesterdayMidnight,
        lt: todayMidnight,
      },
    },
    select: {
      id: true,
      members: {
        where: {
          role: "ADMIN",
        },
        select: { user: { select: { id: true, email: true } }, role: true },
      },
      typebots: {
        select: {
          id: true,
        },
      },
    },
  });

  let resultsSum = 0;
  const newResultsCollectedEvents: TelemetryEvent[] = [];
  for (const workspace of recentWorkspaces) {
    const totalResults = await prisma.result.count({
      where: {
        typebotId: { in: workspace.typebots.map((typebot) => typebot.id) },
        hasStarted: true,
        isArchived: false,
        createdAt: {
          gte: yesterdayMidnight,
        },
      },
    });
    resultsSum += totalResults;
    workspace.members.forEach((member) => {
      newResultsCollectedEvents.push({
        name: "New results collected",
        workspaceId: workspace.id,
        userId: member.user.id,
        data: {
          total: totalResults,
        },
      });
    });
  }

  return {
    totalWorkspaces: recentWorkspaces.length,
    totalResults: resultsSum,
  };
};
