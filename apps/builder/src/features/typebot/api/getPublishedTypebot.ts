import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { publicTypebotSchema } from '@typebot.io/schemas'
import { z } from 'zod'
import { isReadTypebotForbidden } from '../helpers/isReadTypebotForbidden'

export const getPublishedTypebot = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/typebots/{typebotId}/publishedTypebot',
      protect: true,
      summary: 'Get published typebot',
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
      publishedTypebot: publicTypebotSchema.nullable(),
    })
  )
  .query(async ({ input: { typebotId }, ctx: { user } }) => {
    const existingTypebot = await prisma.typebot.findFirst({
      where: {
        id: typebotId,
      },
      include: {
        collaborators: true,
        publishedTypebot: true,
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
      const parsedTypebot = publicTypebotSchema.parse(
        existingTypebot.publishedTypebot
      )

      return {
        publishedTypebot: parsedTypebot,
      }
    } catch (err) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to parse published typebot',
        cause: err,
      })
    }
  })
