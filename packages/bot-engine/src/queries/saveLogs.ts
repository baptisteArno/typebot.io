import type { LogInSession } from "@typebot.io/logs/schemas";
import prisma from "@typebot.io/prisma";

export const saveLogs = (logs: (LogInSession & { resultId: string })[]) =>
  prisma.log.createMany({
    data: logs.map((l) => ({
      ...l,
      status: l.status ?? "error",
    })),
  });
