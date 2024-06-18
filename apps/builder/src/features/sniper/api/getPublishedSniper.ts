import prisma from '@sniper.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import {
  Sniper,
  publicSniperSchema,
  publicSniperSchemaV5,
  publicSniperSchemaV6,
} from '@sniper.io/schemas'
import { z } from 'zod'
import { isReadSniperForbidden } from '../helpers/isReadSniperForbidden'
import { migratePublicSniper } from '@sniper.io/migrations/migrateSniper'

export const getPublishedSniper = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/snipers/{sniperId}/publishedSniper',
      protect: true,
      summary: 'Get published sniper',
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
      publishedSniper: publicSniperSchema.nullable(),
      version: z
        .enum([
          ...publicSniperSchemaV5._def.schema.shape.version._def.values,
          publicSniperSchemaV6.shape.version._def.value,
        ])
        .optional()
        .describe(
          'Provides the version the published bot was migrated from if `migrateToLatestVersion` is set to `true`.'
        ),
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
          publishedSniper: true,
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

      if (!existingSniper.publishedSniper)
        return {
          publishedSniper: null,
        }

      try {
        const parsedSniper = migrateToLatestVersion
          ? await migratePublicSniper(
              publicSniperSchema.parse(existingSniper.publishedSniper)
            )
          : publicSniperSchema.parse(existingSniper.publishedSniper)

        return {
          publishedSniper: parsedSniper,
          version: migrateToLatestVersion
            ? ((existingSniper.version ?? '3') as Sniper['version'])
            : undefined,
        }
      } catch (err) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to parse published sniper',
          cause: err,
        })
      }
    }
  )
