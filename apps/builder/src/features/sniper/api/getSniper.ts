import prisma from '@sniper.io/lib/prisma'
import { publicProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { sniperSchema } from '@sniper.io/schemas'
import { z } from 'zod'
import { isReadSniperForbidden } from '../helpers/isReadSniperForbidden'
import { migrateSniper } from '@sniper.io/migrations/migrateSniper'
import { CollaborationType } from '@sniper.io/prisma'
import { env } from '@sniper.io/env'

export const getSniper = publicProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/snipers/{sniperId}',
      protect: true,
      summary: 'Get a sniper',
      tags: ['Sniper'],
    },
  })
  .input(
    z.object({
      sniperId: z
        .string()
        .describe(
          "[Where to find my bot's ID?](../how-to#how-to-find-my-sniperid)"
        ),
      migrateToLatestVersion: z
        .boolean()
        .optional()
        .default(false)
        .describe(
          'If enabled, the sniper will be converted to the latest schema version'
        ),
    })
  )
  .output(
    z.object({
      sniper: sniperSchema,
      currentUserMode: z.enum(['guest', 'read', 'write']),
    })
  )
  .query(
    async ({ input: { sniperId, migrateToLatestVersion }, ctx: { user } }) => {
      const existingSniper = await prisma.sniper.findFirst({
        where: {
          id: sniperId,
        },
        include: {
          collaborators: true,
          workspace: {
            select: {
              isSuspended: true,
              isPastDue: true,
              members: {
                select: {
                  userId: true,
                },
              },
            },
          },
        },
      })
      if (
        !existingSniper?.id ||
        (await isReadSniperForbidden(existingSniper, user))
      )
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Sniper not found' })

      try {
        const parsedSniper = migrateToLatestVersion
          ? await migrateSniper(sniperSchema.parse(existingSniper))
          : sniperSchema.parse(existingSniper)

        return {
          sniper: parsedSniper,
          currentUserMode: getCurrentUserMode(user, existingSniper),
        }
      } catch (err) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to parse sniper',
          cause: err,
        })
      }
    }
  )

const getCurrentUserMode = (
  user: { email: string | null; id: string } | undefined,
  sniper: { collaborators: { userId: string; type: CollaborationType }[] } & {
    workspace: { members: { userId: string }[] }
  }
) => {
  const collaborator = sniper.collaborators.find((c) => c.userId === user?.id)
  const isMemberOfWorkspace = sniper.workspace.members.some(
    (m) => m.userId === user?.id
  )
  if (
    collaborator?.type === 'WRITE' ||
    collaborator?.type === 'FULL_ACCESS' ||
    isMemberOfWorkspace
  )
    return 'write'

  if (collaborator) return 'read'
  if (user?.email && env.ADMIN_EMAIL?.includes(user.email)) return 'read'
  return 'guest'
}
