import {
  MemberInWorkspace,
  Plan,
  PrismaClient,
  WorkspaceRole,
} from '@typebot.io/prisma'
import { isDefined, isEmpty } from '@typebot.io/lib'
import { getChatsLimit } from '@typebot.io/lib/billing/getChatsLimit'
import { promptAndSetEnvironment } from './utils'
import { TelemetryEvent } from '@typebot.io/schemas/features/telemetry'
import { sendTelemetryEvents } from '@typebot.io/lib/telemetry/sendTelemetryEvent'
import { Workspace } from '@typebot.io/schemas'
import { Stripe } from 'stripe'
import { createId } from '@paralleldrive/cuid2'

const prisma = new PrismaClient()

type WorkspaceForDigest = Pick<
  Workspace,
  | 'id'
  | 'plan'
  | 'customChatsLimit'
  | 'customStorageLimit'
  | 'additionalStorageIndex'
  | 'isQuarantined'
> & {
  members: (Pick<MemberInWorkspace, 'role'> & {
    user: { id: string; email: string | null }
  })[]
}

type ResultWithWorkspace = {
  userId: string
  workspace: {
    id: string
    typebots: {
      id: string
    }[]
    members: {
      user: {
        id: string
        email: string | null
      }
      role: WorkspaceRole
    }[]
    additionalStorageIndex: number
    customChatsLimit: number | null
    customStorageLimit: number | null
    plan: Plan
    isQuarantined: boolean
    stripeId: string | null
  }
  typebotId: string
  totalResultsYesterday: number
  isFirstOfKind: true | undefined
}

export const sendTotalResultsDigest = async () => {
  await promptAndSetEnvironment('production')

  console.log("Generating total results yesterday's digest...")
  const todayMidnight = new Date()
  todayMidnight.setUTCHours(0, 0, 0, 0)
  const yesterday = new Date(todayMidnight)
  yesterday.setDate(yesterday.getDate() - 1)

  const results = await prisma.result.groupBy({
    by: ['typebotId'],
    _count: {
      _all: true,
    },
    where: {
      hasStarted: true,
      createdAt: {
        gte: yesterday,
        lt: todayMidnight,
      },
    },
  })

  console.log(
    `Found ${results.reduce(
      (total, result) => total + result._count._all,
      0
    )} results collected yesterday.`
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
      additionalStorageIndex: true,
      customChatsLimit: true,
      customStorageLimit: true,
      plan: true,
      isQuarantined: true,
      stripeId: true,
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
    .filter(isDefined) satisfies ResultWithWorkspace[]

  console.log('Reporting usage to Stripe...')

  await reportUsageToStripe(resultsWithWorkspaces)

  console.log('Computing workspaces limits...')

  const workspaceLimitReachedEvents = await sendAlertIfLimitReached(
    resultsWithWorkspaces
      .filter((result) => result.isFirstOfKind)
      .map((result) => result.workspace)
  )

  const newResultsCollectedEvents = resultsWithWorkspaces.map(
    (result) =>
      ({
        name: 'New results collected',
        userId: result.userId,
        workspaceId: result.workspace.id,
        typebotId: result.typebotId,
        data: {
          total: result.totalResultsYesterday,
          isFirstOfKind: result.isFirstOfKind,
        },
      } satisfies TelemetryEvent)
  )

  await sendTelemetryEvents(
    workspaceLimitReachedEvents.concat(newResultsCollectedEvents)
  )

  console.log(
    `Sent ${workspaceLimitReachedEvents.length} workspace limit reached events.`
  )
  console.log(
    `Sent ${newResultsCollectedEvents.length} new results collected events.`
  )
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
    if (chatsLimit > 0 && totalChatsUsed >= chatsLimit) {
      events.push(
        ...workspace.members
          .filter((member) => member.role === WorkspaceRole.ADMIN)
          .map(
            (member) =>
              ({
                name: 'Workspace limit reached',
                userId: member.user.id,
                workspaceId: workspace.id,
                data: {
                  totalChatsUsed,
                  chatsLimit,
                },
              } satisfies TelemetryEvent)
          )
      )
      continue
    }
  }
  return events
}

const reportUsageToStripe = async (
  resultsWithWorkspaces: (Pick<ResultWithWorkspace, 'totalResultsYesterday'> & {
    workspace: Pick<
      ResultWithWorkspace['workspace'],
      'id' | 'plan' | 'stripeId'
    >
  })[]
) => {
  if (isEmpty(process.env.STRIPE_SECRET_KEY))
    throw new Error('Missing STRIPE_SECRET_KEY env variable')

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15',
  })

  for (const result of resultsWithWorkspaces.filter(
    (result) =>
      result.workspace.plan === 'STARTER' || result.workspace.plan === 'PRO'
  )) {
    if (!result.workspace.stripeId)
      throw new Error(
        `Found paid workspace without a stripeId: ${result.workspace.stripeId}`
      )
    const subscriptions = await stripe.subscriptions.list({
      customer: result.workspace.stripeId,
    })

    const currentSubscription = subscriptions.data
      .filter((sub) => ['past_due', 'active'].includes(sub.status))
      .sort((a, b) => a.created - b.created)
      .shift()

    if (!currentSubscription)
      throw new Error(
        `Found paid workspace without a subscription: ${result.workspace.stripeId}`
      )

    const subscriptionItem = currentSubscription.items.data.find(
      (item) =>
        item.price.id === process.env.STRIPE_STARTER_CHATS_PRICE_ID ||
        item.price.id === process.env.STRIPE_PRO_CHATS_PRICE_ID
    )

    if (!subscriptionItem)
      throw new Error(
        `Could not find subscription item for workspace ${result.workspace.id}`
      )

    const idempotencyKey = createId()

    await stripe.subscriptionItems.createUsageRecord(
      subscriptionItem.id,
      {
        quantity: result.totalResultsYesterday,
        timestamp: 'now',
      },
      {
        idempotencyKey,
      }
    )
  }
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

  const [totalChatsUsed] = await Promise.all([
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
  ])

  return {
    totalChatsUsed,
  }
}

sendTotalResultsDigest().then()
