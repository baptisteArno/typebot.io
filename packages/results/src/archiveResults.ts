import { env } from "@typebot.io/env";
import type { Group } from "@typebot.io/groups/schemas";
import {
  removeAllObjectsFromResult,
  removeObjectsFromResult,
} from "@typebot.io/lib/s3/removeObjectsRecursively";
import { isDefined } from "@typebot.io/lib/utils";
import type { Prisma } from "@typebot.io/prisma/types";

type ArchiveResultsProps = {
  typebot: {
    groups: Group[];
    workspaceId: string;
    id: string;
  };
  resultsFilter?: Omit<Prisma.Prisma.ResultWhereInput, "typebotId"> & {
    typebotId: string;
  };
};

export const archiveResults =
  (prisma: Prisma.PrismaClient) =>
  async ({ typebot, resultsFilter }: ArchiveResultsProps) => {
    const batchSize = 100;

    let currentTotalResults = 0;

    const resultsCount = await prisma.result.count({
      where: {
        ...resultsFilter,
        OR: [{ isArchived: false }, { isArchived: null }],
      },
    });

    if (resultsCount === 0) return { success: true };

    let progress = 0;

    const isDeletingAllResults = resultsFilter?.id === undefined;

    do {
      progress += batchSize;
      console.log(`Archiving ${progress} / ${resultsCount} results...`);
      const resultsToDelete = await prisma.result.findMany({
        where: {
          ...resultsFilter,
          OR: [{ isArchived: false }, { isArchived: null }],
        },
        select: {
          id: true,
          lastChatSessionId: true,
        },
        take: batchSize,
      });

      if (resultsToDelete.length === 0) break;

      currentTotalResults = resultsToDelete.length;

      const resultIds = resultsToDelete.map((result) => result.id);

      await prisma.$transaction([
        prisma.log.deleteMany({
          where: {
            resultId: { in: resultIds },
          },
        }),
        prisma.answer.deleteMany({
          where: {
            resultId: { in: resultIds },
          },
        }),
        prisma.answerV2.deleteMany({
          where: {
            resultId: { in: resultIds },
          },
        }),
        prisma.visitedEdge.deleteMany({
          where: {
            resultId: { in: resultIds },
          },
        }),
        prisma.setVariableHistoryItem.deleteMany({
          where: {
            resultId: { in: resultIds },
          },
        }),
        prisma.chatSession.deleteMany({
          where: {
            id: {
              in: resultsToDelete
                .map((r) => r.lastChatSessionId)
                .filter(isDefined),
            },
          },
        }),
        prisma.result.updateMany({
          where: {
            id: { in: resultIds },
          },
          data: {
            isArchived: true,
            variables: [],
          },
        }),
      ]);
      if (!isDeletingAllResults && env.S3_BUCKET) {
        await removeObjectsFromResult({
          workspaceId: typebot.workspaceId,
          resultIds: resultIds,
          typebotId: typebot.id,
        });
      }
    } while (currentTotalResults >= batchSize);

    if (isDeletingAllResults && env.S3_BUCKET) {
      await removeAllObjectsFromResult({
        workspaceId: typebot.workspaceId,
        typebotId: typebot.id,
      });
    }

    return { success: true };
  };
