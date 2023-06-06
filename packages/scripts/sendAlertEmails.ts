import {
  MemberInWorkspace,
  Plan,
  PrismaClient,
  WorkspaceRole,
} from '@typebot.io/prisma'
import { isDefined } from '@typebot.io/lib'
import { getChatsLimit } from '@typebot.io/lib/pricing'
import { promptAndSetEnvironment } from './utils'
import { Workspace } from '@typebot.io/schemas'
import { sendAlmostReachedChatsLimitEmail } from '@typebot.io/emails/src/emails/AlmostReachedChatsLimitEmail'
import { sendReachedChatsLimitEmail } from '@typebot.io/emails/src/emails/ReachedChatsLimitEmail'
import { TelemetryEvent } from '@typebot.io/schemas/features/telemetry'
import { sendTelemetryEvents } from '@typebot.io/lib/telemetry/sendTelemetryEvent'

const prisma = new PrismaClient()
const LIMIT_EMAIL_TRIGGER_PERCENT = 0.8

type WorkspaceForDigest = Pick<
  Workspace,
  | 'id'
  | 'plan'
  | 'customChatsLimit'
  | 'additionalChatsIndex'
  | 'isQuarantined'
  | 'chatsLimitFirstEmailSentAt'
  | 'chatsLimitSecondEmailSentAt'
> & {
  members: (Pick<MemberInWorkspace, 'role'> & {
    user: { id: string; email: string | null }
  })[]
}

export const sendTotalResultsDigest = async () => {
  await promptAndSetEnvironment('production')

  console.log('Get collected results from the last hour...')

  const hourAgo = new Date(Date.now() - 1000 * 60 * 60)

  const results = await prisma.result.groupBy({
    by: ['typebotId'],
    _count: {
      _all: true,
    },
    where: {
      hasStarted: true,
      createdAt: {
        gte: hourAgo,
      },
    },
  })

  console.log(
    `Found ${results.reduce(
      (total, result) => total + result._count._all,
      0
    )} results collected for the last hour.`
  )

  const workspaces = await prisma.workspace.findMany({
    where: {
      typebots: {
        some: {
          id: { in: results.map((result) => result.typebotId) },
        },
      },
    },
    select: {
      id: true,
      typebots: { select: { id: true } },
      members: {
        select: { user: { select: { id: true, email: true } }, role: true },
      },
      additionalChatsIndex: true,
      additionalStorageIndex: true,
      customChatsLimit: true,
      customStorageLimit: true,
      plan: true,
      isQuarantined: true,
      chatsLimitFirstEmailSentAt: true,
      chatsLimitSecondEmailSentAt: true,
    },
  })

  const resultsWithWorkspaces = results
    .flatMap((result) => {
      const workspace = workspaces.find((workspace) =>
        workspace.typebots.some((typebot) => typebot.id === result.typebotId)
      )
      if (!workspace) return
      return workspace.members
        .filter((member) => member.role !== WorkspaceRole.GUEST)
        .map((member, memberIndex) => ({
          userId: member.user.id,
          workspace: workspace,
          typebotId: result.typebotId,
          totalResultsYesterday: result._count._all,
          isFirstOfKind: memberIndex === 0 ? (true as const) : undefined,
        }))
    })
    .filter(isDefined)

  console.log('Check limits...')

  const events = await sendAlertIfLimitReached(
    resultsWithWorkspaces
      .filter((result) => result.isFirstOfKind)
      .map((result) => result.workspace)
  )

  console.log(`Send ${events.length} auto quarantine events...`)

  await sendTelemetryEvents(events)
}

const sendAlertIfLimitReached = async (
  workspaces: WorkspaceForDigest[]
): Promise<TelemetryEvent[]> => {
  const events: TelemetryEvent[] = []
  const taggedWorkspaces: string[] = []
  for (const workspace of workspaces) {
    if (taggedWorkspaces.includes(workspace.id) || workspace.isQuarantined)
      continue
    taggedWorkspaces.push(workspace.id)
    const { totalChatsUsed } = await getUsage(workspace.id)
    const chatsLimit = getChatsLimit(workspace)
    if (
      chatsLimit > 0 &&
      totalChatsUsed >= chatsLimit * LIMIT_EMAIL_TRIGGER_PERCENT &&
      totalChatsUsed < chatsLimit &&
      !workspace.chatsLimitFirstEmailSentAt
    ) {
      const to = workspace.members
        .map((member) => member.user.email)
        .filter(isDefined)
      console.log(
        `Send almost reached chats limit email to ${to.join(', ')}...`
      )
      await sendAlmostReachedChatsLimitEmail({
        to: workspace.members
          .map((member) => member.user.email)
          .filter(isDefined),
        usagePercent: Math.round((totalChatsUsed / chatsLimit) * 100),
        chatsLimit,
        url: `https://app.typebot.io/typebots?workspaceId=${workspace.id}`,
      })
      await prisma.workspace.update({
        where: { id: workspace.id },
        data: { chatsLimitFirstEmailSentAt: new Date() },
      })
    }

    if (
      chatsLimit > 0 &&
      totalChatsUsed >= chatsLimit &&
      !workspace.chatsLimitSecondEmailSentAt
    ) {
      const to = workspace.members
        .map((member) => member.user.email)
        .filter(isDefined)
      console.log(`Send reached chats limit email to ${to.join(', ')}...`)
      await sendReachedChatsLimitEmail({
        to,
        chatsLimit,
        url: `https://app.typebot.io/typebots?workspaceId=${workspace.id}`,
      })
      await prisma.workspace.update({
        where: { id: workspace.id },
        data: { chatsLimitSecondEmailSentAt: new Date() },
      })
    }

    if (totalChatsUsed > chatsLimit * 3 && workspace.plan === Plan.FREE) {
      console.log(`Automatically quarantine workspace ${workspace.id}...`)
      await prisma.workspace.update({
        where: { id: workspace.id },
        data: { isQuarantined: true },
      })
      events.push(
        ...workspace.members
          .filter((member) => member.role === WorkspaceRole.ADMIN)
          .map(
            (member) =>
              ({
                name: 'Workspace automatically quarantined',
                userId: member.user.id,
                workspaceId: workspace.id,
                data: {
                  totalChatsUsed,
                  chatsLimit,
                },
              } satisfies TelemetryEvent)
          )
      )
    }
  }
  return events
}

const getUsage = async (workspaceId: string) => {
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const typebots = await prisma.typebot.findMany({
    where: {
      workspace: {
        id: workspaceId,
      },
    },
    select: { id: true },
  })

  const [
    totalChatsUsed,
    {
      _sum: { storageUsed: totalStorageUsed },
    },
  ] = await Promise.all([
    prisma.result.count({
      where: {
        typebotId: { in: typebots.map((typebot) => typebot.id) },
        hasStarted: true,
        createdAt: {
          gte: firstDayOfMonth,
          lt: firstDayOfNextMonth,
        },
      },
    }),
    prisma.answer.aggregate({
      where: {
        storageUsed: { gt: 0 },
        result: {
          typebotId: { in: typebots.map((typebot) => typebot.id) },
        },
      },
      _sum: { storageUsed: true },
    }),
  ])

  return {
    totalChatsUsed,
    totalStorageUsed: totalStorageUsed ?? 0,
  }
}

sendTotalResultsDigest().then()
