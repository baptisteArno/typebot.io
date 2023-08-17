import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { Typebot, typebotSchema } from '@typebot.io/schemas'
import { z } from 'zod'
import { isReadTypebotForbidden } from '../helpers/isReadTypebotForbidden'
import { omit } from '@typebot.io/lib'
import { Typebot as TypebotFromDb } from '@typebot.io/prisma'
import { migrateTypebotFromV3ToV4 } from '@typebot.io/lib/migrations/migrateTypebotFromV3ToV4'
import { parseInvalidTypebot } from '../helpers/parseInvalidTypebot'

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
    })
  )
  .output(
    z.object({
      typebot: typebotSchema,
      isReadOnly: z.boolean(),
    })
  )
  .query(async ({ input: { typebotId }, ctx: { user } }) => {
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
      const parsedTypebot = await parseTypebot(
        omit(existingTypebot, 'collaborators')
      )

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
  })

const parseTypebot = async (typebot: TypebotFromDb): Promise<Typebot> => {
  const parsedTypebot = typebotSchema.parse(
    typebot.version !== '5' ? parseInvalidTypebot(typebot as Typebot) : typebot
  )
  if (['4', '5'].includes(parsedTypebot.version ?? '')) return parsedTypebot
  return migrateTypebotFromV3ToV4(prisma)(parsedTypebot)
}
