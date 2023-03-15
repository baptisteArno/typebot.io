import { PrismaClient, WorkspaceRole } from '@typebot.io/prisma'
import { isDefined } from '@typebot.io/lib'
import { promptAndSetEnvironment } from './utils'
import { TelemetryEvent } from '@typebot.io/schemas/features/telemetry'
import { sendTelemetryEvents } from '@typebot.io/lib/telemetry/sendTelemetryEvent'

const prisma = new PrismaClient()

export const sendTotalResultsDigest = async () => {
  await promptAndSetEnvironment('production')

  console.log("Generating total results yesterday's digest...")
  const todayMidnight = new Date()
  todayMidnight.setHours(0, 0, 0, 0)
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
      members: { select: { userId: true, role: true } },
    },
  })

  const resultsWithWorkspaces = results
    .flatMap((result, resultIndex) => {
      const workspace = workspaces.find((workspace) =>
        workspace.typebots.some((typebot) => typebot.id === result.typebotId)
      )
      if (!workspace) return
      return workspace.members
        .filter((member) => member.role !== WorkspaceRole.GUEST)
        .map((member, memberIndex) => ({
          userId: member.userId,
          workspaceId: workspace.id,
          typebotId: result.typebotId,
          totalResultsYesterday: result._count._all,
          isFirstOfKind:
            resultIndex === 0 && memberIndex === 0
              ? (true as const)
              : undefined,
        }))
    })
    .filter(isDefined)

  const events = resultsWithWorkspaces.map(
    (result) =>
      ({
        name: 'New results collected',
        userId: result.userId,
        workspaceId: result.workspaceId,
        typebotId: result.typebotId,
        data: {
          total: result.totalResultsYesterday,
          isFirstOfKind: result.isFirstOfKind,
        },
      } satisfies TelemetryEvent)
  )

  await sendTelemetryEvents(events)
  console.log(`Sent ${events.length} events.`)
}

sendTotalResultsDigest().then()
