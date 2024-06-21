import prisma from '@sniper.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { isReadSniperForbidden } from '@/features/sniper/helpers/isReadSniperForbidden'
import { isDefined } from '@sniper.io/lib'
import { preprocessSniper } from '@sniper.io/schemas/features/sniper/helpers/preprocessSniper'
import { parseGroups } from '@sniper.io/schemas/features/sniper/group'
import { LogicBlockType } from '@sniper.io/schemas/features/blocks/logic/constants'
import { sniperV5Schema, sniperV6Schema } from '@sniper.io/schemas'

const pick = {
  version: true,
  groups: true,
  variables: true,
  name: true,
} as const

const output = z.object({
  snipers: z.array(
    z.preprocess(
      preprocessSniper,
      z.discriminatedUnion('version', [
        sniperV5Schema._def.schema.pick(pick),
        sniperV6Schema.pick(pick),
      ])
    )
  ),
})

export const getLinkedSnipers = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/snipers/{sniperId}/linkedSnipers',
      protect: true,
      summary: 'Get linked snipers',
      tags: ['Sniper'],
    },
  })
  .input(
    z.object({
      sniperId: z.string(),
    })
  )
  .output(output)
  .query(async ({ input: { sniperId }, ctx: { user } }) => {
    const sniper = await prisma.sniper.findFirst({
      where: {
        id: sniperId,
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

    if (!sniper || (await isReadSniperForbidden(sniper, user)))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'No sniper found' })

    const linkedSniperIds =
      parseGroups(sniper.groups, { sniperVersion: sniper.version })
        .flatMap((group) => group.blocks)
        .reduce<string[]>((sniperIds, block) => {
          if (block.type !== LogicBlockType.SNIPER_LINK) return sniperIds
          const sniperId = block.options?.sniperId
          return isDefined(sniperId) &&
            !sniperIds.includes(sniperId) &&
            block.options?.mergeResults !== false
            ? [...sniperIds, sniperId]
            : sniperIds
        }, []) ?? []

    if (!linkedSniperIds.length) return { snipers: [] }

    const snipers = (
      await prisma.sniper.findMany({
        where: {
          isArchived: { not: true },
          id: { in: linkedSniperIds },
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
      .filter(async (sniper) => !(await isReadSniperForbidden(sniper, user)))
      // To avoid the out of sort memory error, we sort the snipers manually
      .sort((a, b) => {
        return b.createdAt.getTime() - a.createdAt.getTime()
      })
      .map((sniper) => ({
        ...sniper,
        groups: parseGroups(sniper.groups, {
          sniperVersion: sniper.version,
        }),
        variables: sniperV6Schema.shape.variables.parse(sniper.variables),
      }))

    return {
      snipers,
    }
  })
