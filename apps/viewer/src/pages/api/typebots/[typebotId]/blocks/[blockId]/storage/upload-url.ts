import prisma from '@/lib/prisma'
import { InputBlockType, PublicTypebot } from '@typebot.io/schemas'
import { NextApiRequest, NextApiResponse } from 'next'
import {
  badRequest,
  generatePresignedUrl,
  methodNotAllowed,
} from '@typebot.io/lib/api'
import { byId, env, isDefined } from '@typebot.io/lib'
import { getStorageLimit } from '@typebot.io/lib/pricing'
import {
  sendAlmostReachedStorageLimitEmail,
  sendReachedStorageLimitEmail,
} from '@typebot.io/emails'
import { WorkspaceRole } from '@typebot.io/prisma'

const LIMIT_EMAIL_TRIGGER_PERCENT = 0.8

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'GET') {
    if (
      !process.env.S3_ENDPOINT ||
      !process.env.S3_ACCESS_KEY ||
      !process.env.S3_SECRET_KEY
    )
      return badRequest(
        res,
        'S3 not properly configured. Missing one of those variables: S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY'
      )
    const filePath = req.query.filePath as string | undefined
    const fileType = req.query.fileType as string | undefined
    const typebotId = req.query.typebotId as string
    const blockId = req.query.blockId as string
    if (!filePath) return badRequest(res, 'Missing filePath or fileType')
    const hasReachedStorageLimit = await checkIfStorageLimitReached(typebotId)
    const typebot = (await prisma.publicTypebot.findFirst({
      where: { typebotId },
    })) as unknown as PublicTypebot
    const fileUploadBlock = typebot.groups
      .flatMap((g) => g.blocks)
      .find(byId(blockId))
    if (fileUploadBlock?.type !== InputBlockType.FILE)
      return badRequest(res, 'Not a file upload block')
    const sizeLimit = fileUploadBlock.options.sizeLimit
      ? Math.min(fileUploadBlock.options.sizeLimit, 500)
      : 10

    const presignedUrl = generatePresignedUrl({
      fileType,
      filePath,
      sizeLimit: sizeLimit * 1024 * 1024,
    })

    return res.status(200).send({
      presignedUrl,
      hasReachedStorageLimit,
    })
  }
  return methodNotAllowed(res)
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

export default handler
