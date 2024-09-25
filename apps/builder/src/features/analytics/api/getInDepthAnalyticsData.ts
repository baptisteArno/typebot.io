import { canReadTypebots } from "@/helpers/databaseRules";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import { isInputBlock } from "@typebot.io/blocks-core/helpers";
import { parseGroups } from "@typebot.io/groups/schemas";
import prisma from "@typebot.io/prisma";
import { totalAnswersSchema } from "@typebot.io/schemas/features/analytics";
import { z } from "@typebot.io/zod";
import { defaultTimeFilter, timeFilterValues } from "../constants";
import {
  parseFromDateFromTimeFilter,
  parseToDateFromTimeFilter,
} from "../helpers/parseDateFromTimeFilter";

export const getInDepthAnalyticsData = authenticatedProcedure
  .meta({
    openapi: {
      method: "GET",
      path: "/v1/typebots/{typebotId}/analytics/inDepthData",
      protect: true,
      summary:
        "List total answers in blocks and off-default paths visited edges",
      tags: ["Analytics"],
    },
  })
  .input(
    z.object({
      typebotId: z.string(),
      timeFilter: z.enum(timeFilterValues).default(defaultTimeFilter),
      timeZone: z.string().optional(),
    }),
  )
  .output(
    z.object({
      totalAnswers: z.array(totalAnswersSchema),
      offDefaultPathVisitedEdges: z.array(
        z.object({ edgeId: z.string(), total: z.number() }),
      ),
    }),
  )
  .query(
    async ({ input: { typebotId, timeFilter, timeZone }, ctx: { user } }) => {
      const typebot = await prisma.typebot.findFirst({
        where: canReadTypebots(typebotId, user),
        select: { publishedTypebot: true },
      });
      if (!typebot?.publishedTypebot)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Published typebot not found",
        });

      const fromDate = parseFromDateFromTimeFilter(timeFilter, timeZone);
      const toDate = parseToDateFromTimeFilter(timeFilter, timeZone);

      const totalAnswersPerBlock = await prisma.answer.groupBy({
        by: ["blockId", "resultId"],
        where: {
          result: {
            typebotId: typebot.publishedTypebot.typebotId,
            createdAt: fromDate
              ? {
                  gte: fromDate,
                  lte: toDate ?? undefined,
                }
              : undefined,
          },
          blockId: {
            in: parseGroups(typebot.publishedTypebot.groups, {
              typebotVersion: typebot.publishedTypebot.version,
            }).flatMap((group) =>
              group.blocks.filter(isInputBlock).map((block) => block.id),
            ),
          },
        },
      });

      const totalAnswersV2PerBlock = await prisma.answerV2.groupBy({
        by: ["blockId", "resultId"],
        where: {
          result: {
            typebotId: typebot.publishedTypebot.typebotId,
            createdAt: fromDate
              ? {
                  gte: fromDate,
                  lte: toDate ?? undefined,
                }
              : undefined,
          },
          blockId: {
            in: parseGroups(typebot.publishedTypebot.groups, {
              typebotVersion: typebot.publishedTypebot.version,
            }).flatMap((group) =>
              group.blocks.filter(isInputBlock).map((block) => block.id),
            ),
          },
        },
      });

      const uniqueCounts = totalAnswersPerBlock
        .concat(totalAnswersV2PerBlock)
        .reduce<{
          [key: string]: Set<string>;
        }>((acc, { blockId, resultId }) => {
          acc[blockId] = acc[blockId] || new Set();
          acc[blockId].add(resultId);
          return acc;
        }, {});

      const offDefaultPathVisitedEdges = await prisma.visitedEdge.groupBy({
        by: ["edgeId"],
        where: {
          result: {
            typebotId: typebot.publishedTypebot.typebotId,
            createdAt: fromDate
              ? {
                  gte: fromDate,
                  lte: toDate ?? undefined,
                }
              : undefined,
          },
        },
        _count: { resultId: true },
      });

      return {
        totalAnswers: Object.keys(uniqueCounts).map((blockId) => ({
          blockId,
          total: uniqueCounts[blockId].size,
        })),
        offDefaultPathVisitedEdges: offDefaultPathVisitedEdges.map((e) => ({
          edgeId: e.edgeId,
          total: e._count.resultId,
        })),
      };
    },
  );
