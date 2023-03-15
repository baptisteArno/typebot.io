import { deleteFilesFromBucket } from '@/helpers/deleteFilesFromBucket'
import prisma from '@/lib/prisma'
import { Prisma } from '@typebot.io/prisma'
import { InputBlockType, Typebot } from '@typebot.io/schemas'

const batchSize = 100

type Props = {
  typebot: Pick<Typebot, 'groups'>
  resultsFilter?: Omit<Prisma.ResultWhereInput, 'typebotId'> & {
    typebotId: string
  }
}

export const archiveResults = async ({ typebot, resultsFilter }: Props) => {
  const fileUploadBlockIds = typebot.groups
    .flatMap((group) => group.blocks)
    .filter((block) => block.type === InputBlockType.FILE)
    .map((block) => block.id)

  let currentTotalResults = 0

  do {
    const resultsToDelete = await prisma.result.findMany({
      where: {
        ...resultsFilter,
        isArchived: false,
      },
      select: {
        id: true,
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
