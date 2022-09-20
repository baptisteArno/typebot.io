import { almostReachedChatsLimitEmail } from 'assets/emails/almostReachedChatsLimitEmail'
import { reachedSChatsLimitEmail } from 'assets/emails/reachedChatsLimitEmail'
import { Workspace, WorkspaceRole } from 'db'
import prisma from 'libs/prisma'
import { ResultWithAnswers } from 'models'
import { NextApiRequest, NextApiResponse } from 'next'
import { authenticateUser } from 'services/api/utils'
import { env, getChatsLimit, isDefined, parseNumberWithCommas } from 'utils'
import { sendEmailNotification, methodNotAllowed } from 'utils/api'

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
  >
) => {
  const chatLimit = getChatsLimit(workspace)
  if (chatLimit === -1) return
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
    chatsCount >= chatLimit * LIMIT_EMAIL_TRIGGER_PERCENT &&
    !hasSentFirstEmail &&
    env('E2E_TEST') !== 'true'
  )
    await sendAlmostReachChatsLimitEmail({
      workspaceId: workspace.id,
      chatLimit,
      firstDayOfNextMonth,
    })
  if (
    chatsCount >= chatLimit &&
    !hasSentSecondEmail &&
    env('E2E_TEST') !== 'true'
  )
    await sendReachedAlertEmail({
      workspaceId: workspace.id,
      chatLimit,
      firstDayOfNextMonth,
    })
  return chatsCount >= chatLimit
}

const sendAlmostReachChatsLimitEmail = async ({
  workspaceId,
  chatLimit,
  firstDayOfNextMonth,
}: {
  workspaceId: string
  chatLimit: number
  firstDayOfNextMonth: Date
}) => {
  const members = await prisma.memberInWorkspace.findMany({
    where: { role: WorkspaceRole.ADMIN, workspaceId },
    include: { user: { select: { email: true } } },
  })
  const readableChatsLimit = parseNumberWithCommas(chatLimit)
  const readableResetDate = firstDayOfNextMonth
    .toDateString()
    .split(' ')
    .slice(1, 4)
    .join(' ')

  await sendEmailNotification({
    to: members.map((member) => member.user.email).filter(isDefined),
    subject: "You're close to your chats limit",
    html: almostReachedChatsLimitEmail({
      readableChatsLimit,
      readableResetDate,
      url: `${process.env.NEXTAUTH_URL}/typebots?workspaceId=${workspaceId}`,
    }),
  })
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { chatsLimitFirstEmailSentAt: new Date() },
  })
}

const sendReachedAlertEmail = async ({
  workspaceId,
  chatLimit,
  firstDayOfNextMonth,
}: {
  workspaceId: string
  chatLimit: number
  firstDayOfNextMonth: Date
}) => {
  const members = await prisma.memberInWorkspace.findMany({
    where: { role: WorkspaceRole.ADMIN, workspaceId },
    include: { user: { select: { email: true } } },
  })
  const readableChatsLimit = parseNumberWithCommas(chatLimit)
  const readableResetDate = firstDayOfNextMonth
    .toDateString()
    .split(' ')
    .slice(1, 4)
    .join(' ')
  await sendEmailNotification({
    to: members.map((member) => member.user.email).filter(isDefined),
    subject: "You've hit your monthly chats limit",
    html: reachedSChatsLimitEmail({
      readableChatsLimit,
      readableResetDate,
      url: `${process.env.NEXTAUTH_URL}/typebots?workspaceId=${workspaceId}`,
    }),
  })
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { chatsLimitSecondEmailSentAt: new Date() },
  })
}

export default handler
