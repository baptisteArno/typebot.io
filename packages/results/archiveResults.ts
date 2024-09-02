import { Prisma, PrismaClient } from '@typebot.io/prisma'
import { Typebot } from '@typebot.io/schemas'
import { isDefined } from '@typebot.io/lib'
import {
  removeAllObjectsFromResult,
  removeObjectsFromResult,
} from '@typebot.io/lib/s3/removeObjectsRecursively'

type ArchiveResultsProps = {
  typebot: Pick<Typebot, 'groups' | 'workspaceId' | 'id'>
  resultsFilter?: Omit<Prisma.ResultWhereInput, 'typebotId'> & {
    typebotId: string
  }
}

export const archiveResults =
  (prisma: PrismaClient) =>
  async ({ typebot, resultsFilter }: ArchiveResultsProps) => {
    const batchSize = 100

    let currentTotalResults = 0

    const resultsCount = await prisma.result.count({
      where: {
        ...resultsFilter,
        OR: [{ isArchived: false }, { isArchived: null }],
      },
    })

    if (resultsCount === 0) return { success: true }

    let progress = 0

    const isDeletingAllResults = resultsFilter?.id === undefined

    do {
      progress += batchSize
      console.log(`Archiving ${progress} / ${resultsCount} results...`)
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
      })

      if (resultsToDelete.length === 0) break

      currentTotalResults = resultsToDelete.length

      const resultIds = resultsToDelete.map((result) => result.id)

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
      ])
      if (!isDeletingAllResults) {
        await removeObjectsFromResult({
          workspaceId: typebot.workspaceId,
          resultIds: resultIds,
          typebotId: typebot.id,
        })
      }
    } while (currentTotalResults >= batchSize)

    if (isDeletingAllResults) {
      await removeAllObjectsFromResult({
        workspaceId: typebot.workspaceId,
        typebotId: typebot.id,
      })
    }

    return { success: true }
  }
