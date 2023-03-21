import { publicProcedure } from '@/helpers/server/trpc'
import prisma from '@/lib/prisma'
import { TRPCError } from '@trpc/server'
import { getStorageLimit } from '@typebot.io/lib/pricing'
import {
  FileInputBlock,
  InputBlockType,
  LogicBlockType,
  PublicTypebot,
  TypebotLinkBlock,
} from '@typebot.io/schemas'
import { byId, env, isDefined } from '@typebot.io/lib'
import { z } from 'zod'
import { generatePresignedUrl } from '@typebot.io/lib/api/storage'
import {
  sendAlmostReachedStorageLimitEmail,
  sendReachedStorageLimitEmail,
} from '@typebot.io/emails'
import { WorkspaceRole } from '@typebot.io/prisma'

const LIMIT_EMAIL_TRIGGER_PERCENT = 0.8

export const getUploadUrl = publicProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/typebots/{typebotId}/blocks/{blockId}/storage/upload-url',
      summary: 'Get upload URL for a file',
      description: 'Used for the web client to get the bucket upload file.',
    },
  })
  .input(
    z.object({
      typebotId: z.string(),
      blockId: z.string(),
      filePath: z.string(),
      fileType: z.string(),
    })
  )
  .output(
    z.object({
      presignedUrl: z.object({
        url: z.string(),
        fields: z.any(),
      }),
      hasReachedStorageLimit: z.boolean(),
    })
  )
  .query(async ({ input: { typebotId, blockId, filePath, fileType } }) => {
    if (
      !process.env.S3_ENDPOINT ||
      !process.env.S3_ACCESS_KEY ||
      !process.env.S3_SECRET_KEY
    )
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'S3 not properly configured. Missing one of those variables: S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY',
      })

    const hasReachedStorageLimit = await checkIfStorageLimitReached(typebotId)
    const publicTypebot = (await prisma.publicTypebot.findFirst({
      where: { typebotId },
      select: {
        groups: true,
        typebotId: true,
      },
    })) as Pick<PublicTypebot, 'groups' | 'typebotId'>

    const fileUploadBlock = await getFileUploadBlock(publicTypebot, blockId)

    if (!fileUploadBlock)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'File upload block not found',
      })

    const sizeLimit = fileUploadBlock.options.sizeLimit
      ? Math.min(fileUploadBlock.options.sizeLimit, 500)
      : 10

    const presignedUrl = generatePresignedUrl({
      fileType,
      filePath,
      sizeLimit: sizeLimit * 1024 * 1024,
    })

    return {
      presignedUrl,
      hasReachedStorageLimit,
    }
  })

const getFileUploadBlock = async (
  publicTypebot: Pick<PublicTypebot, 'groups' | 'typebotId'>,
  blockId: string
): Promise<FileInputBlock | null> => {
  const fileUploadBlock = publicTypebot.groups
    .flatMap((group) => group.blocks)
    .find(byId(blockId))
  if (fileUploadBlock?.type === InputBlockType.FILE) return fileUploadBlock
  const linkedTypebotIds = publicTypebot.groups
    .flatMap((group) => group.blocks)
    .filter((block) => block.type === LogicBlockType.TYPEBOT_LINK)
    .flatMap((block) => (block as TypebotLinkBlock).options.typebotId)
    .filter(isDefined)
  const linkedTypebots = (await prisma.publicTypebot.findMany({
    where: { typebotId: { in: linkedTypebotIds } },
    select: {
      groups: true,
    },
  })) as Pick<PublicTypebot, 'groups'>[]
  const fileUploadBlockFromLinkedTypebots = linkedTypebots
    .flatMap((typebot) => typebot.groups)
    .flatMap((group) => group.blocks)
    .find(byId(blockId))
  if (fileUploadBlockFromLinkedTypebots?.type === InputBlockType.FILE)
    return fileUploadBlockFromLinkedTypebots
  return null
}

const checkIfStorageLimitReached = async (
  typebotId: string
): Promise<boolean> => {
  const typebot = await prisma.typebot.findUnique({
    where: { id: typebotId },
    include: {
      workspace: {
        select: {
          id: true,
          additionalStorageIndex: true,
          plan: true,
          storageLimitFirstEmailSentAt: true,
          storageLimitSecondEmailSentAt: true,
          customStorageLimit: true,
        },
      },
    },
  })
  if (!typebot?.workspace) throw new Error('Workspace not found')
  const { workspace } = typebot
  const {
    _sum: { storageUsed: totalStorageUsed },
  } = await prisma.answer.aggregate({
    where: {
      storageUsed: { gt: 0 },
      result: {
        typebot: {
          workspaceId: typebot.workspaceId,
        },
      },
    },
    _sum: { storageUsed: true },
  })
  if (!totalStorageUsed) return false
  const hasSentFirstEmail = workspace.storageLimitFirstEmailSentAt !== null
  const hasSentSecondEmail = workspace.storageLimitSecondEmailSentAt !== null
  const storageLimit = getStorageLimit(typebot.workspace)
  if (storageLimit === -1) return false
  const storageLimitBytes = storageLimit * 1024 * 1024 * 1024
  if (
    totalStorageUsed >= storageLimitBytes * LIMIT_EMAIL_TRIGGER_PERCENT &&
    !hasSentFirstEmail &&
    env('E2E_TEST') !== 'true'
  )
    await sendAlmostReachStorageLimitNotification({
      workspaceId: workspace.id,
      storageLimit,
    })
  if (
    totalStorageUsed >= storageLimitBytes &&
    !hasSentSecondEmail &&
    env('E2E_TEST') !== 'true'
  )
    await sendReachStorageLimitNotification({
      workspaceId: workspace.id,
      storageLimit,
    })
  return totalStorageUsed >= storageLimitBytes
}

const sendAlmostReachStorageLimitNotification = async ({
  workspaceId,
  storageLimit,
}: {
  workspaceId: string
  storageLimit: number
}) => {
  const members = await prisma.memberInWorkspace.findMany({
    where: { role: WorkspaceRole.ADMIN, workspaceId },
    include: { user: { select: { email: true } } },
  })

  await sendAlmostReachedStorageLimitEmail({
    to: members.map((member) => member.user.email).filter(isDefined),
    storageLimit,
    url: `${process.env.NEXTAUTH_URL}/typebots?workspaceId=${workspaceId}`,
  })

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { storageLimitFirstEmailSentAt: new Date() },
  })
}

const sendReachStorageLimitNotification = async ({
  workspaceId,
  storageLimit,
}: {
  workspaceId: string
  storageLimit: number
}) => {
  const members = await prisma.memberInWorkspace.findMany({
    where: { role: WorkspaceRole.ADMIN, workspaceId },
    include: { user: { select: { email: true } } },
  })

  await sendReachedStorageLimitEmail({
    to: members.map((member) => member.user.email).filter(isDefined),
    storageLimit,
    url: `${process.env.NEXTAUTH_URL}/typebots?workspaceId=${workspaceId}`,
  })

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { storageLimitSecondEmailSentAt: new Date() },
  })
}
