import prisma from '@/lib/prisma'
import { deleteFiles } from '@/utils/api/storage'
import { Prisma } from 'db'
import { InputBlockType, Typebot } from 'models'

export const archiveResults = async ({
  typebot,
  resultsFilter,
}: {
  typebot: Pick<Typebot, 'groups'>
  resultsFilter?: Prisma.ResultWhereInput
}) => {
  const fileUploadBlockIds = typebot.groups
    .flatMap((g) => g.blocks)
    .filter((b) => b.type === InputBlockType.FILE)
    .map((b) => b.id)
  if (fileUploadBlockIds.length > 0) {
    const filesToDelete = await prisma.answer.findMany({
      where: { result: resultsFilter, blockId: { in: fileUploadBlockIds } },
    })
    if (filesToDelete.length > 0)
      await deleteFiles({
        urls: filesToDelete.flatMap((a) => a.content.split(', ')),
      })
  }
  await prisma.log.deleteMany({
    where: {
      result: resultsFilter,
    },
  })
  await prisma.answer.deleteMany({
    where: {
      result: resultsFilter,
    },
  })
  await prisma.result.updateMany({
    where: resultsFilter,
    data: {
      isArchived: true,
      variables: [],
    },
  })

  return { success: true }
}
