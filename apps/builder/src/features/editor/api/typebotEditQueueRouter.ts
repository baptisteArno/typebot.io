import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import prisma from '@typebot.io/lib/prisma'
import { router } from '@/helpers/server/trpc'

export const typebotEditQueueRouter = router({
  listByTypebotId: authenticatedProcedure
    .input(
      z.object({
        typebotId: z.string(),
      })
    )
    .query(async ({ input: { typebotId } }) => {
      try {
        const queueItems = await prisma.typebotEditQueue.findMany({
          where: {
            typebotId,
          },
          orderBy: {
            joinedAt: 'asc',
          },
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        })

        return queueItems
      } catch (error) {
        console.error('❌ API: Failed to list edit queue:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to list edit queue',
        })
      }
    }),

  join: authenticatedProcedure
    .input(
      z.object({
        typebotId: z.string(),
      })
    )
    .mutation(async ({ input: { typebotId }, ctx: { user } }) => {
      if (!user.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You need to be authenticated to join the edit queue',
        })
      }

      try {
        const existingQueueItem = await prisma.typebotEditQueue.findFirst({
          where: {
            userId: user.id,
            typebotId,
          },
        })

        if (existingQueueItem) {
          await prisma.typebotEditQueue.update({
            where: {
              id: existingQueueItem.id,
            },
            data: {},
          })

          return {
            success: true,
            message: 'User already in edit queue, activity updated',
          }
        }

        await prisma.typebotEditQueue.create({
          data: {
            userId: user.id,
            typebotId,
            joinedAt: new Date(),
          },
        })

        return {
          success: true,
          message: 'User added to edit queue',
        }
      } catch (error) {
        console.error('❌ API: Failed to join edit queue:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to join edit queue',
        })
      }
    }),

  leave: authenticatedProcedure
    .input(
      z.object({
        typebotId: z.string(),
      })
    )
    .mutation(async ({ input: { typebotId }, ctx: { user } }) => {
      if (!user.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You need to be authenticated to leave the edit queue',
        })
      }

      try {
        await prisma.typebotEditQueue.deleteMany({
          where: {
            userId: user.id,
            typebotId,
          },
        })

        return {
          success: true,
          message: 'User removed from edit queue',
        }
      } catch (error) {
        console.error('❌ API: Failed to leave edit queue:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to leave edit queue',
        })
      }
    }),

  updateActivity: authenticatedProcedure
    .input(
      z.object({
        typebotId: z.string(),
      })
    )
    .mutation(async ({ input: { typebotId }, ctx: { user } }) => {
      if (!user.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You need to be authenticated to update activity',
        })
      }

      try {
        await prisma.typebotEditQueue.upsert({
          where: {
            userId_typebotId: {
              userId: user.id,
              typebotId,
            },
          },
          update: {
            lastActivityAt: new Date(),
          },
          create: {
            userId: user.id,
            typebotId,
            joinedAt: new Date(),
            lastActivityAt: new Date(),
          },
        })

        return {
          success: true,
          message: 'Activity updated successfully',
        }
      } catch (error) {
        console.error('❌ API: Failed to update activity:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update activity',
        })
      }
    }),

  cleanupInactiveUsers: authenticatedProcedure
    .input(
      z.object({
        typebotId: z.string(),
        inactivityThresholdMinutes: z.number().default(10),
      })
    )
    .mutation(async ({ input: { typebotId, inactivityThresholdMinutes } }) => {
      try {
        const thresholdDate = new Date(
          Date.now() - inactivityThresholdMinutes * 60 * 1000
        )

        const queueItems = await prisma.typebotEditQueue.findMany({
          where: {
            typebotId,
          },
        })

        const inactiveUserIds = queueItems
          .filter((user) => user.lastActivityAt < thresholdDate)
          .map((user) => user.id)

        let removedCount = 0
        if (inactiveUserIds.length > 0) {
          const result = await prisma.typebotEditQueue.deleteMany({
            where: {
              id: {
                in: inactiveUserIds,
              },
            },
          })
          removedCount = result.count
        }

        return {
          success: true,
          removedCount,
          message: `${removedCount} inactive users removed from edit queue`,
        }
      } catch (error) {
        console.error('❌ API: Failed to cleanup inactive users:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to cleanup inactive users',
        })
      }
    }),
})
