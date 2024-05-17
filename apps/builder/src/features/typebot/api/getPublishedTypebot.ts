import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import {
  Typebot,
  publicTypebotSchema,
  publicTypebotSchemaV5,
  publicTypebotSchemaV6,
} from '@typebot.io/schemas'
import { z } from 'zod'
import { isReadTypebotForbidden } from '../helpers/isReadTypebotForbidden'
import { migratePublicTypebot } from '@typebot.io/migrations/migrateTypebot'

export const getPublishedTypebot = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/typebots/{typebotId}/publishedTypebot',
      protect: true,
      summary: 'Get published typebot',
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
      migrateToLatestVersion: z
        .boolean()
        .optional()
        .default(false)
        .describe(
          'If enabled, the typebot will be converted to the latest schema version'
        ),
    })
  )
  .output(
    z.object({
      publishedTypebot: publicTypebotSchema.nullable(),
      version: z
        .enum([
          ...publicTypebotSchemaV5._def.schema.shape.version._def.values,
          publicTypebotSchemaV6.shape.version._def.value,
        ])
        .optional()
        .describe(
          'Provides the version the published bot was migrated from if `migrateToLatestVersion` is set to `true`.'
        ),
    })
  )
  .query(
    async ({ input: { typebotId, migrateToLatestVersion }, ctx: { user } }) => {
      const existingTypebot = await prisma.typebot.findFirst({
        where: {
          id: typebotId,
        },
        include: {
          collaborators: true,
          publishedTypebot: true,
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
        !existingTypebot?.id ||
        (await isReadTypebotForbidden(existingTypebot, user))
      )
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Typebot not found' })

      if (!existingTypebot.publishedTypebot)
        return {
          publishedTypebot: null,
        }

      try {
        const parsedTypebot = migrateToLatestVersion
          ? await migratePublicTypebot(
              publicTypebotSchema.parse(existingTypebot.publishedTypebot)
            )
          : publicTypebotSchema.parse(existingTypebot.publishedTypebot)

        return {
          publishedTypebot: parsedTypebot,
          version: migrateToLatestVersion
            ? ((existingTypebot.version ?? '3') as Typebot['version'])
            : undefined,
        }
      } catch (err) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to parse published typebot',
          cause: err,
        })
      }
    }
  )
