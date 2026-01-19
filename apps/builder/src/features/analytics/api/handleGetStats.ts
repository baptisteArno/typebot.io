import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import type { Stats } from "@typebot.io/results/schemas/answers";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { canReadTypebots } from "@/helpers/databaseRules";
import { defaultTimeFilter, timeFilterValues } from "../constants";
import {
  parseFromDateFromTimeFilter,
  parseToDateFromTimeFilter,
} from "../helpers/parseDateFromTimeFilter";

export const getStatsInputSchema = z.object({
  typebotId: z.string(),
  timeFilter: z.enum(timeFilterValues).default(defaultTimeFilter),
  timeZone: z.string().optional(),
});

export const handleGetStats = async ({
  input: { typebotId, timeFilter, timeZone },
  context: { user },
}: {
  input: z.infer<typeof getStatsInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
  const typebot = await prisma.typebot.findFirst({
    where: canReadTypebots(typebotId, user),
    select: { publishedTypebot: true, id: true },
  });
  if (!typebot?.publishedTypebot)
    throw new ORPCError("NOT_FOUND", {
      message: "Published typebot not found",
    });

  const fromDate = parseFromDateFromTimeFilter(timeFilter, timeZone);
  const toDate = parseToDateFromTimeFilter(timeFilter, timeZone);

  const [totalViews, totalStarts, totalCompleted] = await prisma.$transaction([
    prisma.result.count({
      where: {
        typebotId: typebot.id,
        isArchived: false,
        createdAt: fromDate
          ? {
              gte: fromDate,
              lte: toDate ?? undefined,
            }
          : undefined,
      },
    }),
    prisma.result.count({
      where: {
        typebotId: typebot.id,
        isArchived: false,
        hasStarted: true,
        createdAt: fromDate
          ? {
              gte: fromDate,
              lte: toDate ?? undefined,
            }
          : undefined,
      },
    }),
    prisma.result.count({
      where: {
        typebotId: typebot.id,
        isArchived: false,
        isCompleted: true,
        createdAt: fromDate
          ? {
              gte: fromDate,
              lte: toDate ?? undefined,
            }
          : undefined,
      },
    }),
  ]);

  const stats: Stats = {
    totalViews,
    totalStarts,
    totalCompleted,
  };

  return {
    stats,
  };
};
