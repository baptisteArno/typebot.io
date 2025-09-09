import { TRPCError } from "@trpc/server";
import { isInputBlock } from "@typebot.io/blocks-core/helpers";
import { parseGroups } from "@typebot.io/groups/helpers/parseGroups";
import prisma from "@typebot.io/prisma";
import { edgeSchema } from "@typebot.io/typebot/schemas/edge";
import { z } from "@typebot.io/zod";
import { canReadTypebots } from "@/helpers/databaseRules";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { defaultTimeFilter, timeFilterValues } from "../constants";
import { getVisitedEdgeToPropFromId } from "../helpers/getVisitedEdgeToPropFromId";
import {
  parseFromDateFromTimeFilter,
  parseToDateFromTimeFilter,
} from "../helpers/parseDateFromTimeFilter";
import { edgeWithTotalVisitsSchema, totalAnswersSchema } from "../schemas";

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
      offDefaultPathVisitedEdges: z.array(edgeWithTotalVisitsSchema),
    }),
  )
  .query(
    async ({ input: { typebotId, timeFilter, timeZone }, ctx: { user } }) => {
      const typebot = await prisma.typebot.findFirst({
        where: canReadTypebots(typebotId, user),
        select: {
          publishedTypebot: {
            select: {
              groups: true,
              version: true,
              edges: true,
            },
          },
        },
      });
      if (!typebot?.publishedTypebot)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Published typebot not found",
        });

      const fromDate = parseFromDateFromTimeFilter(timeFilter, timeZone);
      const toDate = parseToDateFromTimeFilter(timeFilter, timeZone);

      const totalAnswersPerBlock = await prisma.answer.groupBy({
        by: ["blockId"],
        where: {
          result: {
            typebotId,
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
        _count: { resultId: true },
      });

      const totalAnswersV2PerBlock = await prisma.answerV2.groupBy({
        by: ["blockId"],
        where: {
          result: {
            typebotId,
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
        _count: { resultId: true },
      });

      const offDefaultPathVisitedEdges = await prisma.visitedEdge.groupBy({
        by: ["edgeId"],
        where: {
          result: {
            typebotId,
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

      const edges = z.array(edgeSchema).parse(typebot.publishedTypebot.edges);

      return {
        totalAnswers: totalAnswersPerBlock
          .concat(totalAnswersV2PerBlock)
          .map((block) => ({
            blockId: block.blockId,
            total: block._count.resultId,
          })),
        offDefaultPathVisitedEdges: offDefaultPathVisitedEdges.map(
          (visitedEdge) => ({
            id: visitedEdge.edgeId,
            total: visitedEdge._count.resultId,
            to: getVisitedEdgeToPropFromId(visitedEdge.edgeId, { edges }),
          }),
        ),
      };
    },
  );
