import {
  MemberInWorkspace,
  Plan,
  PrismaClient,
  WorkspaceRole,
} from '@typebot.io/prisma'
import { isDefined, isEmpty } from '@typebot.io/lib'
import { getChatsLimit } from '@typebot.io/lib/billing/getChatsLimit'
import { getUsage } from '@typebot.io/lib/api/getUsage'
import { promptAndSetEnvironment } from './utils'
import { Workspace } from '@typebot.io/schemas'
import { sendAlmostReachedChatsLimitEmail } from '@typebot.io/emails/src/emails/AlmostReachedChatsLimitEmail'
import { TelemetryEvent } from '@typebot.io/schemas/features/telemetry'
import { sendTelemetryEvents } from '@typebot.io/lib/telemetry/sendTelemetryEvent'
import Stripe from 'stripe'
import { createId } from '@paralleldrive/cuid2'

const prisma = new PrismaClient()
const LIMIT_EMAIL_TRIGGER_PERCENT = 0.75

type WorkspaceForDigest = Pick<
  Workspace,
  | 'id'
  | 'plan'
  | 'name'
  | 'customChatsLimit'
  | 'isQuarantined'
  | 'chatsLimitFirstEmailSentAt'
  | 'chatsLimitSecondEmailSentAt'
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

export const checkAndReportChatsUsage = async () => {
  await promptAndSetEnvironment('production')

  console.log('Get collected results from the last hour...')

  const zeroedMinutesHour = new Date()
  zeroedMinutesHour.setUTCMinutes(0, 0, 0)
  const hourAgo = new Date(zeroedMinutesHour.getTime() - 1000 * 60 * 60)

  const results = await prisma.result.groupBy({
    by: ['typebotId'],
    _count: {
      _all: true,
    },
    where: {
      hasStarted: true,
      createdAt: {
        lt: zeroedMinutesHour,
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
      name: true,
      typebots: { select: { id: true } },
      members: {
        select: { user: { select: { id: true, email: true } }, role: true },
      },
      additionalStorageIndex: true,
      customChatsLimit: true,
      customStorageLimit: true,
      plan: true,
      isQuarantined: true,
      chatsLimitFirstEmailSentAt: true,
      chatsLimitSecondEmailSentAt: true,
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
    .filter(isDefined)

  console.log('Check limits...')

  const events = await sendAlertIfLimitReached(
    resultsWithWorkspaces
      .filter((result) => result.isFirstOfKind)
      .map((result) => result.workspace)
  )

  await reportUsageToStripe(resultsWithWorkspaces)

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

  console.log(
    `Send ${newResultsCollectedEvents.length} new results events and ${events.length} auto quarantine events...`
  )

  await sendTelemetryEvents(events.concat(newResultsCollectedEvents))
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
    const { totalChatsUsed } = await getUsage(prisma)(workspace.id)
    const chatsLimit = getChatsLimit(workspace)
    if (
      chatsLimit > 0 &&
      totalChatsUsed >= chatsLimit * LIMIT_EMAIL_TRIGGER_PERCENT &&
      totalChatsUsed < chatsLimit &&
      !workspace.chatsLimitFirstEmailSentAt
    ) {
      const to = workspace.members
        .filter((member) => member.role === WorkspaceRole.ADMIN)
        .map((member) => member.user.email)
        .filter(isDefined)
      console.log(
        `Send almost reached chats limit email to ${to.join(', ')}...`
      )
      try {
        await sendAlmostReachedChatsLimitEmail({
          to,
          usagePercent: Math.round((totalChatsUsed / chatsLimit) * 100),
          chatsLimit,
          workspaceName: workspace.name,
        })
        await prisma.workspace.updateMany({
          where: { id: workspace.id },
          data: { chatsLimitFirstEmailSentAt: new Date() },
        })
      } catch (err) {
        console.error(err)
      }
    }

    if (totalChatsUsed > chatsLimit * 1.5 && workspace.plan === Plan.FREE) {
      console.log(`Automatically quarantine workspace ${workspace.id}...`)
      await prisma.workspace.updateMany({
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

checkAndReportChatsUsage().then()
