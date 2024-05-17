import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { isReadTypebotForbidden } from '@/features/typebot/helpers/isReadTypebotForbidden'
import { isDefined } from '@typebot.io/lib'
import { preprocessTypebot } from '@typebot.io/schemas/features/typebot/helpers/preprocessTypebot'
import { parseGroups } from '@typebot.io/schemas/features/typebot/group'
import { LogicBlockType } from '@typebot.io/schemas/features/blocks/logic/constants'
import { typebotV5Schema, typebotV6Schema } from '@typebot.io/schemas'

const pick = {
  version: true,
  groups: true,
  variables: true,
  name: true,
} as const

const output = z.object({
  typebots: z.array(
    z.preprocess(
      preprocessTypebot,
      z.discriminatedUnion('version', [
        typebotV5Schema._def.schema.pick(pick),
        typebotV6Schema.pick(pick),
      ])
    )
  ),
})

export const getLinkedTypebots = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/typebots/{typebotId}/linkedTypebots',
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
  .output(output)
  .query(async ({ input: { typebotId }, ctx: { user } }) => {
    const typebot = await prisma.typebot.findFirst({
      where: {
        id: typebotId,
      },
      select: {
        id: true,
        version: true,
        groups: true,
        variables: true,
        name: true,
        createdAt: true,
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
      parseGroups(typebot.groups, { typebotVersion: typebot.version })
        .flatMap((group) => group.blocks)
        .reduce<string[]>((typebotIds, block) => {
          if (block.type !== LogicBlockType.TYPEBOT_LINK) return typebotIds
          const typebotId = block.options?.typebotId
          return isDefined(typebotId) &&
            !typebotIds.includes(typebotId) &&
            block.options?.mergeResults !== false
            ? [...typebotIds, typebotId]
            : typebotIds
        }, []) ?? []

    if (!linkedTypebotIds.length) return { typebots: [] }

    const typebots = (
      await prisma.typebot.findMany({
        where: {
          isArchived: { not: true },
          id: { in: linkedTypebotIds },
        },
        select: {
          id: true,
          version: true,
          groups: true,
          variables: true,
          name: true,
          createdAt: true,
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
        groups: parseGroups(typebot.groups, {
          typebotVersion: typebot.version,
        }),
        variables: typebotV6Schema.shape.variables.parse(typebot.variables),
      }))

    return {
      typebots,
    }
  })
