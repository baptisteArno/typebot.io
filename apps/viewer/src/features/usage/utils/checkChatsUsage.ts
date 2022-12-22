import prisma from '@/lib/prisma'
import { WorkspaceRole } from 'db'
import {
  sendAlmostReachedChatsLimitEmail,
  sendReachedChatsLimitEmail,
} from 'emails'
import { env, getChatsLimit, isDefined } from 'utils'

const LIMIT_EMAIL_TRIGGER_PERCENT = 0.8

export const checkChatsUsage = async (typebotId: string) => {
  const typebot = await prisma.typebot.findUnique({
    where: {
      id: typebotId,
    },
    include: {
      workspace: {
        select: {
          id: true,
          plan: true,
          additionalChatsIndex: true,
          chatsLimitFirstEmailSentAt: true,
          chatsLimitSecondEmailSentAt: true,
          customChatsLimit: true,
        },
      },
    },
  })

  const workspace = typebot?.workspace

  if (!workspace) return false

  const chatsLimit = getChatsLimit(workspace)
  if (chatsLimit === -1) return
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const chatsCount = await prisma.$transaction(async (tx) => {
    const typebotIds = await tx.typebot.findMany({
      where: {
        workspaceId: workspace.id,
      },
      select: { id: true },
    })

    return tx.result.count({
      where: {
        typebotId: { in: typebotIds.map((typebot) => typebot.id) },
        hasStarted: true,
        createdAt: { gte: firstDayOfMonth, lte: firstDayOfNextMonth },
      },
    })
  })
  const hasSentFirstEmail =
    workspace.chatsLimitFirstEmailSentAt !== null &&
    workspace.chatsLimitFirstEmailSentAt < firstDayOfNextMonth &&
    workspace.chatsLimitFirstEmailSentAt > firstDayOfMonth
  const hasSentSecondEmail =
    workspace.chatsLimitSecondEmailSentAt !== null &&
    workspace.chatsLimitSecondEmailSentAt < firstDayOfNextMonth &&
    workspace.chatsLimitSecondEmailSentAt > firstDayOfMonth
  if (
    chatsCount >= chatsLimit * LIMIT_EMAIL_TRIGGER_PERCENT &&
    !hasSentFirstEmail &&
    env('E2E_TEST') !== 'true'
  )
    await sendAlmostReachChatsLimitNotification({
      workspaceId: workspace.id,
      chatsLimit,
    })
  if (
    chatsCount >= chatsLimit &&
    !hasSentSecondEmail &&
    env('E2E_TEST') !== 'true'
  )
    await sendReachedAlertNotification({
      workspaceId: workspace.id,
      chatsLimit,
    })
  return chatsCount >= chatsLimit
}

const sendAlmostReachChatsLimitNotification = async ({
  workspaceId,
  chatsLimit,
}: {
  workspaceId: string
  chatsLimit: number
}) => {
  const members = await prisma.memberInWorkspace.findMany({
    where: { role: WorkspaceRole.ADMIN, workspaceId },
    include: { user: { select: { email: true } } },
  })

  await sendAlmostReachedChatsLimitEmail({
    to: members.map((member) => member.user.email).filter(isDefined),
    chatsLimit,
    url: `${process.env.NEXTAUTH_URL}/typebots?workspaceId=${workspaceId}`,
  })

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { chatsLimitFirstEmailSentAt: new Date() },
  })
}

const sendReachedAlertNotification = async ({
  workspaceId,
  chatsLimit,
}: {
  workspaceId: string
  chatsLimit: number
}) => {
  const members = await prisma.memberInWorkspace.findMany({
    where: { role: WorkspaceRole.ADMIN, workspaceId },
    include: { user: { select: { email: true } } },
  })

  await sendReachedChatsLimitEmail({
    to: members.map((member) => member.user.email).filter(isDefined),
    chatsLimit,
    url: `${process.env.NEXTAUTH_URL}/typebots?workspaceId=${workspaceId}`,
  })

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { chatsLimitSecondEmailSentAt: new Date() },
  })
}
