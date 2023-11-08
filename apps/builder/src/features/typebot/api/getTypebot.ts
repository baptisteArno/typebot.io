import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { typebotSchema } from '@typebot.io/schemas'
import { z } from 'zod'
import { isReadTypebotForbidden } from '../helpers/isReadTypebotForbidden'
import { migrateTypebot } from '@typebot.io/lib/migrations/migrateTypebot'

export const getTypebot = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/typebots/{typebotId}',
      protect: true,
      summary: 'Get a typebot',
      tags: ['Typebot'],
    },
  })
  .input(
    z.object({
      typebotId: z.string(),
      migrateToLatestVersion: z
        .boolean()
        .optional()
        .describe(
          'If enabled, the typebot will be converted to the latest schema version'
        ),
    })
  )
  .output(
    z.object({
      typebot: typebotSchema,
      isReadOnly: z.boolean(),
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
        },
      })
      if (
        !existingTypebot?.id ||
        (await isReadTypebotForbidden(existingTypebot, user))
      )
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Typebot not found' })

      try {
        const parsedTypebot = migrateToLatestVersion
          ? await migrateTypebot(typebotSchema.parse(existingTypebot))
          : typebotSchema.parse(existingTypebot)

        return {
          typebot: parsedTypebot,
          isReadOnly:
            existingTypebot.collaborators.find(
              (collaborator) => collaborator.userId === user.id
            )?.type === 'READ' ?? false,
        }
      } catch (err) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to parse typebot',
          cause: err,
        })
      }
    }
  )
