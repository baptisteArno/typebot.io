import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { isReadTypebotForbidden } from '../helpers/isReadTypebotForbidden'
import { TypebotHistoryOrigin } from '@typebot.io/prisma'

export const getTypebotHistory = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/typebots/{typebotId}/history',
      protect: true,
      summary: 'Get history snapshots for a typebot',
      tags: ['Typebot'],
    },
  })
  .input(
    z.object({
      typebotId: z
        .string()
        .describe(
          "[Where to find my bot's ID?](../how-to#how-to-find-my-typebotid)"
        ),
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().optional(),
      excludeContent: z.boolean().default(false).optional(),
      historyId: z.string().optional(),
    })
  )
  .output(
    z.object({
      history: z.array(
        z.object({
          id: z.string(),
          createdAt: z.date(),
          origin: z.nativeEnum(TypebotHistoryOrigin),
          version: z.string(),
          isRestored: z.boolean(),
          restoredFromId: z.string().nullable(),
          publishedAt: z.date().nullable(),
          author: z
            .object({
              id: z.string(),
              name: z.string().nullable(),
              email: z.string().nullable(),
              image: z.string().nullable(),
            })
            .nullable(),
          content: z
            .object({
              name: z.string(),
              icon: z.string().nullable(),
              groups: z.any().nullable(),
              events: z.any().nullable(),
              variables: z.any().nullable(),
              edges: z.any().nullable(),
              theme: z.any().nullable(),
              settings: z.any().nullable(),
            })
            .optional(),
        })
      ),
      nextCursor: z.string().nullable(),
      totalCount: z.number(),
      oldestDate: z.date().nullable(),
      newestDate: z.date().nullable(),
    })
  )
  .query(
    async ({
      input: { typebotId, limit, cursor, excludeContent, historyId },
      ctx: { user },
    }) => {
      const existingTypebot = await prisma.typebot.findFirst({
        where: {
          id: typebotId,
        },
        select: {
          id: true,
          workspaceId: true,
          collaborators: {
            select: {
              userId: true,
              type: true,
            },
          },
          workspace: {
            select: {
              id: true,
              isSuspended: true,
              isPastDue: true,
              members: {
                select: {
                  userId: true,
                  role: true,
                },
              },
            },
          },
        },
      })

      if (
        !existingTypebot?.id ||
        (await isReadTypebotForbidden(existingTypebot, user))
      )
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Typebot not found',
        })

      const where = historyId ? { id: historyId, typebotId } : { typebotId }

      // Get total count and date range
      const [totalCount, oldestRecord, newestRecord] = await Promise.all([
        prisma.typebotHistory.count({
          where,
        }),
        prisma.typebotHistory.findFirst({
          where,
          orderBy: { createdAt: 'asc' },
          select: { createdAt: true },
        }),
        prisma.typebotHistory.findFirst({
          where,
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true },
        }),
      ])

      const history = await prisma.typebotHistory.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          createdAt: true,
          origin: true,
          version: true,
          isRestored: true,
          restoredFromId: true,
          publishedAt: true,
          author: {
            select: { id: true, name: true, email: true, image: true },
          },
          ...(!excludeContent
            ? {
                name: true,
                icon: true,
                groups: true,
                events: true,
                variables: true,
                edges: true,
                theme: true,
                settings: true,
              }
            : {}),
        },
      })

      let nextCursor: string | null = null
      if (history.length > limit) {
        const nextItem = history.pop()
        nextCursor = nextItem!.id
      }

      return {
        history: history.map((item) => ({
          id: item.id,
          createdAt: item.createdAt,
          origin: item.origin as TypebotHistoryOrigin,
          version: item.version ?? '',
          isRestored: item.isRestored ?? false,
          restoredFromId: item.restoredFromId,
          publishedAt: item.publishedAt,
          author: item.author,
          ...(!excludeContent && 'name' in item
            ? {
                content: {
                  name: item.name,
                  icon: item.icon,
                  groups: item.groups,
                  events: item.events,
                  variables: item.variables,
                  edges: item.edges,
                  theme: item.theme,
                  settings: item.settings,
                },
              }
            : {}),
        })),
        nextCursor,
        totalCount,
        oldestDate: oldestRecord?.createdAt || null,
        newestDate: newestRecord?.createdAt || null,
      }
    }
  )
