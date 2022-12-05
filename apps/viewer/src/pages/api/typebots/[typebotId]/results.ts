import { authenticateUser } from '@/features/auth/api'
import prisma from '@/lib/prisma'
import { WorkspaceRole } from 'db'
import {
  sendAlmostReachedChatsLimitEmail,
  sendReachedChatsLimitEmail,
} from 'emails'
import { ResultWithAnswers, Workspace } from 'models'
import { NextApiRequest, NextApiResponse } from 'next'
import { env, getChatsLimit, isDefined } from 'utils'
import { methodNotAllowed } from 'utils/api'

const LIMIT_EMAIL_TRIGGER_PERCENT = 0.8

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const user = await authenticateUser(req)
    if (!user) return res.status(401).json({ message: 'Not authenticated' })
    const typebotId = req.query.typebotId as string
    const limit = Number(req.query.limit)
    const results = (await prisma.result.findMany({
      where: {
        typebot: {
          id: typebotId,
          workspace: { members: { some: { userId: user.id } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { answers: true },
    })) as unknown as ResultWithAnswers[]
    return res.send({ results })
  }
  if (req.method === 'POST') {
    const typebotId = req.query.typebotId as string
    const result = await prisma.result.create({
      data: {
        typebotId,
        isCompleted: false,
      },
      include: {
        typebot: {
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
        },
      },
    })
    const hasReachedLimit = await checkChatsUsage(result.typebot.workspace)
    res.send({ result, hasReachedLimit })
    return
  }
  methodNotAllowed(res)
}

const checkChatsUsage = async (
  workspace: Pick<
    Workspace,
    | 'id'
    | 'plan'
    | 'additionalChatsIndex'
    | 'chatsLimitFirstEmailSentAt'
    | 'chatsLimitSecondEmailSentAt'
    | 'customChatsLimit'
  >
) => {
  const chatsLimit = getChatsLimit(workspace)
  if (chatsLimit === -1) return
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const chatsCount = await prisma.result.count({
    where: {
      typebot: { workspaceId: workspace.id },
      hasStarted: true,
      createdAt: { gte: firstDayOfMonth, lte: lastDayOfMonth },
    },
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

export default handler
