import prisma from "@typebot.io/prisma/withReadReplica";
import type { TelemetryEvent } from "@typebot.io/telemetry/schemas";
import { trackEvents } from "@typebot.io/telemetry/trackEvents";

export const trackAndReportYesterdaysResults = async () => {
  const todayMidnight = new Date();
  todayMidnight.setUTCHours(0, 0, 0, 0);
  const yesterdayMidnight = new Date();
  yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1);
  yesterdayMidnight.setUTCHours(0, 0, 0, 0);

  const recentWorkspaces = await prisma.workspace.findMany({
    where: {
      lastActivityAt: {
        gte: yesterdayMidnight,
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
        createdAt: {
          gte: yesterdayMidnight,
          lt: todayMidnight,
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

  await trackEvents(newResultsCollectedEvents);

  return {
    totalWorkspaces: recentWorkspaces.length,
    totalResults: resultsSum,
  };
};
