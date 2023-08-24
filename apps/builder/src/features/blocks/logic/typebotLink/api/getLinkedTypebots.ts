import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { LogicBlockType, typebotSchema } from '@typebot.io/schemas'
import { z } from 'zod'
import { isReadTypebotForbidden } from '@/features/typebot/helpers/isReadTypebotForbidden'
import { isDefined } from '@typebot.io/lib'

export const getLinkedTypebots = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/typebots/{typebotId}/linkedTypebots',
      protect: true,
      summary: 'Get linked typebots',
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
      typebots: z.array(
        typebotSchema._def.schema.pick({
          id: true,
          groups: true,
          variables: true,
          name: true,
        })
      ),
    })
  )
  .query(async ({ input: { typebotId }, ctx: { user } }) => {
    const typebot = await prisma.typebot.findFirst({
      where: {
        id: typebotId,
      },
      select: {
        id: true,
        groups: true,
        variables: true,
        name: true,
        createdAt: true,
        workspaceId: true,
        collaborators: {
          select: {
            type: true,
            userId: true,
          },
        },
      },
    })

    if (!typebot || (await isReadTypebotForbidden(typebot, user)))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'No typebot found' })

    const linkedTypebotIds =
      typebotSchema._def.schema.shape.groups
        .parse(typebot.groups)
        .flatMap((group) => group.blocks)
        .reduce<string[]>(
          (typebotIds, block) =>
            block.type === LogicBlockType.TYPEBOT_LINK &&
            isDefined(block.options.typebotId) &&
            !typebotIds.includes(block.options.typebotId) &&
            block.options.mergeResults !== false
              ? [...typebotIds, block.options.typebotId]
              : typebotIds,
          []
        ) ?? []

    if (!linkedTypebotIds.length) return { typebots: [] }

    const typebots = (
      await prisma.typebot.findMany({
        where: {
          isArchived: { not: true },
          id: { in: linkedTypebotIds },
        },
        select: {
          id: true,
          groups: true,
          variables: true,
          name: true,
          createdAt: true,
          workspaceId: true,
          collaborators: {
            select: {
              type: true,
              userId: true,
            },
          },
        },
      })
    )
      .filter(async (typebot) => !(await isReadTypebotForbidden(typebot, user)))
      // To avoid the out of sort memory error, we sort the typebots manually
      .sort((a, b) => {
        return b.createdAt.getTime() - a.createdAt.getTime()
      })
      .map((typebot) => ({
        ...typebot,
        groups: typebotSchema._def.schema.shape.groups.parse(typebot.groups),
        variables: typebotSchema._def.schema.shape.variables.parse(
          typebot.variables
        ),
      }))

    return {
      typebots,
    }
  })
