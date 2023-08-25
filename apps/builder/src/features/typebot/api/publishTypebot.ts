import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { InputBlockType, typebotSchema } from '@typebot.io/schemas'
import { z } from 'zod'
import { isWriteTypebotForbidden } from '../helpers/isWriteTypebotForbidden'
import { sendTelemetryEvents } from '@typebot.io/lib/telemetry/sendTelemetryEvent'
import { Plan } from '@typebot.io/prisma'

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
        workspace: {
          select: {
            plan: true,
          },
        },
      },
    })
    if (
      !existingTypebot?.id ||
      (await isWriteTypebotForbidden(existingTypebot, user))
    )
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Typebot not found' })

    if (existingTypebot.workspace.plan === Plan.FREE) {
      const hasFileUploadBlocks = typebotSchema._def.schema.shape.groups
        .parse(existingTypebot.groups)
        .some((group) =>
          group.blocks.some((block) => block.type === InputBlockType.FILE)
        )

      if (hasFileUploadBlocks)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: "File upload blocks can't be published on the free plan",
        })
    }

    if (existingTypebot.publishedTypebot)
      await prisma.publicTypebot.updateMany({
        where: {
          id: existingTypebot.publishedTypebot.id,
        },
        data: {
          version: existingTypebot.version,
          edges: typebotSchema._def.schema.shape.edges.parse(
            existingTypebot.edges
          ),
          groups: typebotSchema._def.schema.shape.groups.parse(
            existingTypebot.groups
          ),
          settings: typebotSchema._def.schema.shape.settings.parse(
            existingTypebot.settings
          ),
          variables: typebotSchema._def.schema.shape.variables.parse(
            existingTypebot.variables
          ),
          theme: typebotSchema._def.schema.shape.theme.parse(
            existingTypebot.theme
          ),
        },
      })
    else
      await prisma.publicTypebot.createMany({
        data: {
          version: existingTypebot.version,
          typebotId: existingTypebot.id,
          edges: typebotSchema._def.schema.shape.edges.parse(
            existingTypebot.edges
          ),
          groups: typebotSchema._def.schema.shape.groups.parse(
            existingTypebot.groups
          ),
          settings: typebotSchema._def.schema.shape.settings.parse(
            existingTypebot.settings
          ),
          variables: typebotSchema._def.schema.shape.variables.parse(
            existingTypebot.variables
          ),
          theme: typebotSchema._def.schema.shape.theme.parse(
            existingTypebot.theme
          ),
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
