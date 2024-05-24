import { Prisma, PrismaClient } from '@typebot.io/prisma'
import { Block, Typebot } from '@typebot.io/schemas'
import { deleteFilesFromBucket } from '@typebot.io/lib/s3/deleteFilesFromBucket'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'
import { isDefined } from '@typebot.io/lib'

type ArchiveResultsProps = {
  typebot: Pick<Typebot, 'groups'>
  resultsFilter?: Omit<Prisma.ResultWhereInput, 'typebotId'> & {
    typebotId: string
  }
}

export const archiveResults =
  (prisma: PrismaClient) =>
  async ({ typebot, resultsFilter }: ArchiveResultsProps) => {
    const batchSize = 100
    const fileUploadBlockIds = typebot.groups
      .flatMap<Block>((group) => group.blocks)
      .filter((block) => block.type === InputBlockType.FILE)
      .map((block) => block.id)

    let currentTotalResults = 0

    const resultsCount = await prisma.result.count({
      where: {
        ...resultsFilter,
        OR: [{ isArchived: false }, { isArchived: null }],
      },
    })

    if (resultsCount === 0) return { success: true }

    let progress = 0

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

      if (fileUploadBlockIds.length > 0) {
        const filesToDelete = await prisma.answer.findMany({
          where: {
            resultId: { in: resultIds },
            blockId: { in: fileUploadBlockIds },
          },
        })
        if (filesToDelete.length > 0)
          await deleteFilesFromBucket({
            urls: filesToDelete.flatMap((a) => a.content.split(', ')),
          })
      }

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
    } while (currentTotalResults >= batchSize)

    return { success: true }
  }
