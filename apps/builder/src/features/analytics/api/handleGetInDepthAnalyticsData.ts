import { ORPCError } from "@orpc/server";
import { isInputBlock } from "@typebot.io/blocks-core/helpers";
import { parseGroups } from "@typebot.io/groups/helpers/parseGroups";
import prisma from "@typebot.io/prisma";
import {
  defaultTimeFilter,
  parseFromDateFromTimeFilter,
  parseToDateFromTimeFilter,
  timeFilterValues,
} from "@typebot.io/results/timeFilter";
import { edgeSchema } from "@typebot.io/typebot/schemas/edge";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { canReadTypebots } from "@/helpers/databaseRules";
import { getVisitedEdgeToPropFromId } from "../helpers/getVisitedEdgeToPropFromId";

export const getInDepthAnalyticsDataInputSchema = z.object({
  typebotId: z.string(),
  timeFilter: z.enum(timeFilterValues).default(defaultTimeFilter),
  timeZone: z.string().optional(),
});

export const handleGetInDepthAnalyticsData = async ({
  input: { typebotId, timeFilter, timeZone },
  context: { user },
}: {
  input: z.infer<typeof getInDepthAnalyticsDataInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
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
    throw new ORPCError("NOT_FOUND", {
      message: "Published typebot not found",
    });

  const fromDate = parseFromDateFromTimeFilter(timeFilter, timeZone);
  const toDate = parseToDateFromTimeFilter(timeFilter, timeZone);

  // Shared by all three aggregations, so parse the published groups once instead of
  // rebuilding the same block id list for every query.
  const resultFilter = {
    typebotId,
    createdAt: fromDate
      ? {
          gte: fromDate,
          lte: toDate ?? undefined,
        }
      : undefined,
  };

  const inputBlockIds = parseGroups(typebot.publishedTypebot.groups, {
    typebotVersion: typebot.publishedTypebot.version,
  }).flatMap((group) =>
    group.blocks.filter(isInputBlock).map((block) => block.id),
  );

  // The three aggregations are independent, so run them concurrently: the endpoint now
  // waits for the slowest one rather than the sum of all three.
  const [
    totalAnswersPerBlock,
    totalAnswersV2PerBlock,
    offDefaultPathVisitedEdges,
  ] = await Promise.all([
    prisma.answer.groupBy({
      by: ["blockId"],
      where: {
        result: resultFilter,
        blockId: { in: inputBlockIds },
      },
      _count: { resultId: true },
    }),
    prisma.answerV2.groupBy({
      by: ["blockId"],
      where: {
        result: resultFilter,
        blockId: { in: inputBlockIds },
      },
      _count: { resultId: true },
    }),
    prisma.visitedEdge.groupBy({
      by: ["edgeId"],
      where: {
        result: resultFilter,
      },
      _count: { resultId: true },
    }),
  ]);

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
};
