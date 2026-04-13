import prisma from '@typebot.io/lib/prisma'
import { Prisma } from '@typebot.io/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { canReadTypebots } from '@/helpers/databaseRules'
import { defaultTimeFilter, timeFilterValues } from '../constants'
import {
  parseFromDateFromTimeFilter,
  parseToDateFromTimeFilter,
} from '../helpers/parseDateFromTimeFilter'

const analyticsInputSchema = z.object({
  typebotId: z.string(),
  timeFilter: z.enum(timeFilterValues).default(defaultTimeFilter),
  timeZone: z.string().optional(),
})

type AnalyticsInput = z.infer<typeof analyticsInputSchema>

const resolveTypebotAndDateFilter = async (
  input: AnalyticsInput,
  user: { id: string }
) => {
  const typebot = await prisma.typebot.findFirst({
    where: canReadTypebots(input.typebotId, user),
    select: { id: true },
  })
  if (!typebot)
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Typebot not found' })

  const fromDate = parseFromDateFromTimeFilter(input.timeFilter, input.timeZone)
  const toDate = parseToDateFromTimeFilter(input.timeFilter, input.timeZone)

  const dateFilter = fromDate
    ? { gte: fromDate, ...(toDate ? { lte: toDate } : {}) }
    : undefined

  const baseWhere = {
    typebotId: typebot.id,
    isArchived: false as const,
    createdAt: dateFilter,
  }

  return { typebot, baseWhere }
}

type TypebotGroup = {
  id: string
  blocks: Array<{
    id: string
    type: string
    options?: { action?: string }
  }>
}

const loadTypebotGroups = async (
  typebotId: string
): Promise<TypebotGroup[]> => {
  const typebotFull = await prisma.typebot.findUnique({
    where: { id: typebotId },
    select: { groups: true },
  })
  if (!typebotFull?.groups || !Array.isArray(typebotFull.groups)) return []
  return typebotFull.groups as TypebotGroup[]
}

// ---------------------------------------------------------------------------
// getBlockVisitStats
// ---------------------------------------------------------------------------

const groupStatsSchema = z.object({
  groupId: z.string(),
  visits: z.number(),
  visitPercentage: z.number(),
})

const blockIssueSchema = z.object({
  blockId: z.string(),
  groupId: z.string(),
  type: z.enum(['abandoned', 'error']),
  count: z.number(),
  percentage: z.number(),
})

export const getBlockVisitStats = authenticatedProcedure
  .input(analyticsInputSchema)
  .output(
    z.object({
      totalSessions: z.number(),
      groupStats: z.array(groupStatsSchema),
      blockIssues: z.array(blockIssueSchema),
    })
  )
  .query(async ({ input, ctx: { user } }) => {
    const { typebot, baseWhere } = await resolveTypebotAndDateFilter(
      input,
      user
    )

    const totalSessions = await prisma.result.count({ where: baseWhere })
    if (totalSessions === 0)
      return { totalSessions: 0, groupStats: [], blockIssues: [] }

    const groups = await loadTypebotGroups(typebot.id)
    const claudiaBlockIds = new Set<string>()
    for (const group of groups) {
      for (const block of group.blocks) {
        if (block.type === 'claudia') claudiaBlockIds.add(block.id)
      }
    }

    const groupVisits = new Map<string, number>()
    const blockIssuesMap = new Map<
      string,
      {
        blockId: string
        groupId: string
        type: 'abandoned' | 'error'
        count: number
      }
    >()

    const BATCH_SIZE = 1000
    let cursor: string | undefined
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const batch = await prisma.result.findMany({
        where: {
          ...baseWhere,
          NOT: { visitedBlocks: { equals: Prisma.JsonNull } },
        },
        select: { id: true, visitedBlocks: true, status: true },
        take: BATCH_SIZE,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { id: 'asc' },
      })
      if (batch.length === 0) break

      for (const result of batch) {
        const blocks = Array.isArray(result.visitedBlocks)
          ? (result.visitedBlocks as Array<{
              blockId: string
              groupId: string
              status: string
            }>)
          : []

        if (blocks.length === 0) continue

        const visitedGroupIds = new Set<string>()
        for (const block of blocks) {
          visitedGroupIds.add(block.groupId)
        }
        for (const gid of visitedGroupIds) {
          groupVisits.set(gid, (groupVisits.get(gid) ?? 0) + 1)
        }

        const lastBlock = blocks[blocks.length - 1]

        if (claudiaBlockIds.has(lastBlock.blockId)) continue

        const isError =
          lastBlock.status === 'dead_end' ||
          lastBlock.status === 'error' ||
          result.status === 'error'
        const isAbandoned =
          !isError &&
          (lastBlock.status === 'abandoned' || result.status === 'abandoned')

        if (isError || isAbandoned) {
          const type = isError ? 'error' : 'abandoned'
          const key = `${lastBlock.blockId}::${lastBlock.groupId}::${type}`
          const entry = blockIssuesMap.get(key) ?? {
            blockId: lastBlock.blockId,
            groupId: lastBlock.groupId,
            type,
            count: 0,
          }
          entry.count++
          blockIssuesMap.set(key, entry)
        }
      }

      cursor = batch[batch.length - 1].id
      if (batch.length < BATCH_SIZE) break
    }

    const groupStats = Array.from(groupVisits.entries()).map(
      ([groupId, visits]) => ({
        groupId,
        visits,
        visitPercentage:
          totalSessions > 0
            ? Math.round((visits / totalSessions) * 100)
            : 0,
      })
    )

    const blockIssues = Array.from(blockIssuesMap.values()).map((entry) => ({
      ...entry,
      percentage:
        totalSessions > 0
          ? Math.round((entry.count / totalSessions) * 100)
          : 0,
    }))

    return { totalSessions, groupStats, blockIssues }
  })

// ---------------------------------------------------------------------------
// getCxStats
// ---------------------------------------------------------------------------

const cxStatsSchema = z.object({
  totalSessions: z.number(),
  completed: z.number(),
  errors: z.number(),
  abandoned: z.number(),
  completionRate: z.number(),
  forwardToHumansN2: z.number(),
  endFlowN1: z.number(),
  answerTicket: z.number(),
  closeTicket: z.number(),
  avgSessionDurationMs: z.number().nullable(),
  volumeByDay: z.array(
    z.object({
      date: z.string(),
      count: z.number(),
    })
  ),
})

export const getCxStats = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/typebots/{typebotId}/analytics/cx-stats',
      protect: true,
      summary: 'Get CX analytics stats',
      tags: ['Analytics'],
    },
  })
  .input(analyticsInputSchema)
  .output(z.object({ cxStats: cxStatsSchema }))
  .query(async ({ input, ctx: { user } }) => {
    const { typebot, baseWhere } = await resolveTypebotAndDateFilter(
      input,
      user
    )

    const [totalSessions, completed, errors, abandoned] =
      await prisma.$transaction([
        prisma.result.count({ where: baseWhere }),
        prisma.result.count({
          where: { ...baseWhere, status: 'completed' },
        }),
        prisma.result.count({ where: { ...baseWhere, status: 'error' } }),
        prisma.result.count({
          where: { ...baseWhere, status: 'abandoned' },
        }),
      ])

    const completionRate =
      totalSessions > 0
        ? Math.round((completed / totalSessions) * 10000) / 100
        : 0

    const groups = await loadTypebotGroups(typebot.id)
    const claudiaActionByBlockId = new Map<string, string>()
    for (const group of groups) {
      for (const block of group.blocks) {
        if (block.type === 'claudia' && block.options?.action) {
          claudiaActionByBlockId.set(block.id, block.options.action)
        }
      }
    }

    const claudiaActionToMetric: Record<string, string> = {
      'Forward to Human [N2]': 'forwardToHumansN2',
      'End Flow [N1]': 'endFlowN1',
      'Answer Ticket [N1]': 'answerTicket',
      'Close Ticket [N1]': 'closeTicket',
    }

    const metricCounters = new Map<string, number>()
    let totalDurationMs = 0
    let durationCount = 0
    const volumeMap = new Map<string, number>()

    const BATCH_SIZE = 1000
    let cursor: string | undefined
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const batch = await prisma.result.findMany({
        where: baseWhere,
        select: {
          id: true,
          visitedBlocks: true,
          createdAt: true,
        },
        take: BATCH_SIZE,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { id: 'asc' },
      })
      if (batch.length === 0) break

      for (const result of batch) {
        const day = result.createdAt.toISOString().split('T')[0]
        volumeMap.set(day, (volumeMap.get(day) ?? 0) + 1)

        const blocks = Array.isArray(result.visitedBlocks)
          ? (result.visitedBlocks as Array<{
              blockId: string
              groupId: string
              timestamp: string
              status: string
            }>)
          : []

        for (const block of blocks) {
          const action = claudiaActionByBlockId.get(block.blockId)
          if (!action) continue
          const metric = claudiaActionToMetric[action]
          if (metric)
            metricCounters.set(metric, (metricCounters.get(metric) ?? 0) + 1)
        }

        if (blocks.length > 0) {
          const start = result.createdAt.getTime()
          const lastTs = new Date(
            blocks[blocks.length - 1].timestamp
          ).getTime()
          if (lastTs > start) {
            totalDurationMs += lastTs - start
            durationCount++
          }
        }
      }

      cursor = batch[batch.length - 1].id
      if (batch.length < BATCH_SIZE) break
    }

    const avgSessionDurationMs =
      durationCount > 0 ? Math.round(totalDurationMs / durationCount) : null

    const volumeByDay = Array.from(volumeMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return {
      cxStats: {
        totalSessions,
        completed,
        errors,
        abandoned,
        completionRate,
        forwardToHumansN2: metricCounters.get('forwardToHumansN2') ?? 0,
        endFlowN1: metricCounters.get('endFlowN1') ?? 0,
        answerTicket: metricCounters.get('answerTicket') ?? 0,
        closeTicket: metricCounters.get('closeTicket') ?? 0,
        avgSessionDurationMs,
        volumeByDay,
      },
    }
  })
