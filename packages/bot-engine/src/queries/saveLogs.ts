import prisma from "@typebot.io/prisma";
import type { Log } from "@typebot.io/results/schemas/results";

export const saveLogs = (logs: Omit<Log, "id" | "createdAt">[]) =>
  prisma.log.createMany({ data: logs });
