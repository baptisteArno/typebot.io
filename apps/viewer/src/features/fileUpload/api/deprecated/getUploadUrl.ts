import { publicProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import {
  Block,
  FileInputBlock,
  SniperLinkBlock,
  parseGroups,
} from '@sniper.io/schemas'
import { byId, isDefined } from '@sniper.io/lib'
import { z } from 'zod'
import { generatePresignedUrl } from '@sniper.io/lib/s3/deprecated/generatePresignedUrl'
import { env } from '@sniper.io/env'
import prisma from '@sniper.io/lib/prisma'
import { InputBlockType } from '@sniper.io/schemas/features/blocks/inputs/constants'
import { LogicBlockType } from '@sniper.io/schemas/features/blocks/logic/constants'
import { PublicSniper } from '@sniper.io/prisma'

export const getUploadUrl = publicProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/snipers/{sniperId}/blocks/{blockId}/storage/upload-url',
      summary: 'Get upload URL for a file',
      description: 'Used for the web client to get the bucket upload file.',
      deprecated: true,
      tags: ['Deprecated'],
    },
  })
  .input(
    z.object({
      sniperId: z.string(),
      blockId: z.string(),
      filePath: z.string(),
      fileType: z.string().optional(),
    })
  )
  .output(
    z.object({
      presignedUrl: z.string(),
      hasReachedStorageLimit: z.boolean(),
    })
  )
  .query(async ({ input: { sniperId, blockId, filePath, fileType } }) => {
    if (!env.S3_ENDPOINT || !env.S3_ACCESS_KEY || !env.S3_SECRET_KEY)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'S3 not properly configured. Missing one of those variables: S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY',
      })

    const publicSniper = await prisma.publicSniper.findFirst({
      where: { sniperId },
      select: {
        version: true,
        groups: true,
        sniperId: true,
      },
    })

    if (!publicSniper)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Sniper not found',
      })

    const fileUploadBlock = await getFileUploadBlock(publicSniper, blockId)

    if (!fileUploadBlock)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'File upload block not found',
      })

    const presignedUrl = await generatePresignedUrl({
      fileType,
      filePath,
    })

    return {
      presignedUrl,
      hasReachedStorageLimit: false,
    }
  })

const getFileUploadBlock = async (
  publicSniper: Pick<PublicSniper, 'groups' | 'sniperId' | 'version'>,
  blockId: string
): Promise<FileInputBlock | null> => {
  const groups = parseGroups(publicSniper.groups, {
    sniperVersion: publicSniper.version,
  })
  const fileUploadBlock = groups
    .flatMap<Block>((group) => group.blocks)
    .find(byId(blockId))
  if (fileUploadBlock?.type === InputBlockType.FILE) return fileUploadBlock
  const linkedSniperIds = groups
    .flatMap<Block>((group) => group.blocks)
    .filter((block) => block.type === LogicBlockType.SNIPER_LINK)
    .flatMap((block) => (block as SniperLinkBlock).options?.sniperId)
    .filter(isDefined)
  const linkedSnipers = await prisma.publicSniper.findMany({
    where: { sniperId: { in: linkedSniperIds } },
    select: {
      groups: true,
    },
  })
  const fileUploadBlockFromLinkedSnipers = parseGroups(
    linkedSnipers.flatMap((sniper) => sniper.groups),
    { sniperVersion: publicSniper.version }
  )
    .flatMap<Block>((group) => group.blocks)
    .find(byId(blockId))
  if (fileUploadBlockFromLinkedSnipers?.type === InputBlockType.FILE)
    return fileUploadBlockFromLinkedSnipers
  return null
}
