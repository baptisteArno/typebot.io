import { env } from '@typebot.io/env'
import { Prisma, PrismaClient } from '@typebot.io/prisma'
import { InputBlockType, Typebot } from '@typebot.io/schemas'
import { Client } from 'minio'

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
      .flatMap((group) => group.blocks)
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

const deleteFilesFromBucket = async ({
  urls,
}: {
  urls: string[]
}): Promise<void> => {
  if (!env.S3_ENDPOINT || !env.S3_ACCESS_KEY || !env.S3_SECRET_KEY)
    throw new Error(
      'S3 not properly configured. Missing one of those variables: S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY'
    )

  const minioClient = new Client({
    endPoint: env.S3_ENDPOINT,
    port: env.S3_PORT,
    useSSL: env.S3_SSL,
    accessKey: env.S3_ACCESS_KEY,
    secretKey: env.S3_SECRET_KEY,
    region: env.S3_REGION,
  })

  const bucket = env.S3_BUCKET ?? 'typebot'

  return minioClient.removeObjects(
    bucket,
    urls
      .filter((url) => url.includes(env.S3_ENDPOINT as string))
      .map((url) => url.split(`/${bucket}/`)[1])
  )
}
