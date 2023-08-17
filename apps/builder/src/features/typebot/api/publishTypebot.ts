import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { typebotSchema } from '@typebot.io/schemas'
import { z } from 'zod'
import { isWriteTypebotForbidden } from '../helpers/isWriteTypebotForbidden'
import { sendTelemetryEvents } from '@typebot.io/lib/telemetry/sendTelemetryEvent'

export const publishTypebot = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/typebots/{typebotId}/publish',
      protect: true,
      summary: 'Publish a typebot',
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
      message: z.literal('success'),
    })
  )
  .mutation(async ({ input: { typebotId }, ctx: { user } }) => {
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
      (await isWriteTypebotForbidden(existingTypebot, user))
    )
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Typebot not found' })

    if (existingTypebot.publishedTypebot)
      await prisma.publicTypebot.updateMany({
        where: {
          id: existingTypebot.publishedTypebot.id,
        },
        data: {
          version: existingTypebot.version,
          edges: typebotSchema.shape.edges.parse(existingTypebot.edges),
          groups: typebotSchema.shape.groups.parse(existingTypebot.groups),
          settings: typebotSchema.shape.settings.parse(
            existingTypebot.settings
          ),
          variables: typebotSchema.shape.variables.parse(
            existingTypebot.variables
          ),
          theme: typebotSchema.shape.theme.parse(existingTypebot.theme),
        },
      })
    else
      await prisma.publicTypebot.createMany({
        data: {
          version: existingTypebot.version,
          typebotId: existingTypebot.id,
          edges: typebotSchema.shape.edges.parse(existingTypebot.edges),
          groups: typebotSchema.shape.groups.parse(existingTypebot.groups),
          settings: typebotSchema.shape.settings.parse(
            existingTypebot.settings
          ),
          variables: typebotSchema.shape.variables.parse(
            existingTypebot.variables
          ),
          theme: typebotSchema.shape.theme.parse(existingTypebot.theme),
        },
      })

    await sendTelemetryEvents([
      {
        name: 'Typebot published',
        workspaceId: existingTypebot.workspaceId,
        typebotId: existingTypebot.id,
        userId: user.id,
        data: {
          name: existingTypebot.name,
          isFirstPublish: existingTypebot.publishedTypebot ? undefined : true,
        },
      },
    ])

    return { message: 'success' }
  })
