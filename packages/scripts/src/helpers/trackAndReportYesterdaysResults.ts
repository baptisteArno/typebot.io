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
        select: {
          createdAt: true,
          user: { select: { id: true, email: true } },
          role: true,
        },
      },
      typebots: {
        select: {
          id: true,
        },
      },
    },
  });

  console.log("🔍 Found", recentWorkspaces.length, "workspaces");

  let resultsSum = 0;
  const newResultsCollectedEvents: TelemetryEvent[] = [];
  for (const workspace of recentWorkspaces) {
    console.log("Getting total results for workspace", workspace.id);
    const results = await prisma.result.groupBy({
      by: ["typebotId"],
      _count: {
        _all: true,
      },
      where: {
        typebotId: { in: workspace.typebots.map((typebot) => typebot.id) },
        hasStarted: true,
        createdAt: {
          gte: yesterdayMidnight,
          lt: todayMidnight,
        },
      },
    });
    const olderAdmin = workspace.members
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .at(0);
    if (!olderAdmin) continue;
    for (const result of results) {
      if (result._count._all === 0) continue;
      newResultsCollectedEvents.push({
        name: "New results collected",
        typebotId: result.typebotId,
        workspaceId: workspace.id,
        userId: olderAdmin.user.id,
        data: {
          total: result._count._all,
        },
      });
      resultsSum += result._count._all;
    }
  }

  await trackEvents(newResultsCollectedEvents);

  return {
    totalWorkspaces: recentWorkspaces.length,
    totalResults: resultsSum,
  };
};
