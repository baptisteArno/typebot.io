import prisma from "@typebot.io/prisma/withReadReplica";
import { destroyWorkspace } from "./destroyWorkspace";

const daysTrigger = 60;
const remainingDaysNotice = 30;
const remainingDaysSecondNotice = 7;
const hourMs = 1000 * 60 * 60 * 24;

export const deleteOrWarnInactiveWorkspaces = async () => {
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const triggerDate = new Date(todayMidnight.getTime() - hourMs * daysTrigger);

  const inactiveWorkspaces = await prisma.workspace.findMany({
    where: {
      lastActivityAt: {
        lte: triggerDate,
      },
    },
    select: {
      id: true,
      _count: {
        select: {
          typebots: true,
        },
      },
      members: {
        where: {
          role: "ADMIN",
        },
        select: {
          user: {
            select: {
              lastActivityAt: true,
            },
          },
        },
      },
      inactiveFirstEmailSentAt: true,
      inactiveSecondEmailSentAt: true,
    },
  });

  let totalDeletedWorkspaces = 0;
  for (const workspace of inactiveWorkspaces) {
    if (workspace._count.typebots === 0) {
      await destroyWorkspace(workspace.id);
      totalDeletedWorkspaces++;
      continue;
    }
    const anyMemberLastActiveDate = workspace.members.reduce<Date | null>(
      (latestActivityDate, member) => {
        if (
          !latestActivityDate ||
          member.user.lastActivityAt < latestActivityDate
        )
          return member.user.lastActivityAt;
        return latestActivityDate;
      },
      null,
    );
    if (anyMemberLastActiveDate && anyMemberLastActiveDate > triggerDate) {
      await prisma.workspace.update({
        where: {
          id: workspace.id,
        },
        data: {
          lastActivityAt: anyMemberLastActiveDate,
        },
      });
    }
    if (!workspace.inactiveFirstEmailSentAt) {
      await sendFirstInactivityWarningEmail(workspace);
      await prisma.workspace.update({
        where: {
          id: workspace.id,
        },
        data: {
          inactiveFirstEmailSentAt: new Date(),
        },
      });
    } else if (
      !workspace.inactiveSecondEmailSentAt &&
      workspace.inactiveFirstEmailSentAt.getTime() <
        todayMidnight.getTime() -
          hourMs * (remainingDaysNotice - remainingDaysSecondNotice)
    ) {
      await sendSecondInactivityWarningEmail(workspace);
      await prisma.workspace.update({
        where: {
          id: workspace.id,
        },
        data: {
          inactiveSecondEmailSentAt: new Date(),
        },
      });
    } else if (
      workspace.inactiveSecondEmailSentAt &&
      workspace.inactiveSecondEmailSentAt.getTime() <
        todayMidnight.getTime() - hourMs * remainingDaysSecondNotice
    ) {
      await destroyWorkspace(workspace.id);
      totalDeletedWorkspaces++;
    }
  }
  return {
    totalDeletedWorkspaces,
  };
};

const sendFirstInactivityWarningEmail = async (_workspace: any) => {};
const sendSecondInactivityWarningEmail = async (_workspace: any) => {};
