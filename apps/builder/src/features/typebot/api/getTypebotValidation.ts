import { publicProcedure } from '@/helpers/server/trpc'
import prisma from '@typebot.io/lib/prisma'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

type Block = {
  type: string
  outgoingEdgeId?: string | null
}
type Group = {
  title: string
  blocks: Block[]
}

const typebotValidationSchema = z.object({
  typebotId: z.string().describe('Typebot id to be validated'),
})

const responseSchema = z.object({
  isValid: z.boolean(),
  outgoingEdgeIds: z.array(z.string().nullable()),
  invalidGroups: z.array(z.string()),
})

export const getTypebotValidation = publicProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/typebots/{typebotId}/validate',
      protect: true,
      summary: 'Validate a typebot',
      tags: ['Typebot'],
    },
  })
  .input(typebotValidationSchema)
  .output(responseSchema)
  .query(async ({ input: { typebotId } }) => {
    const typebot = await prisma.typebot.findFirst({
      where: {
        id: typebotId,
      },
      select: {
        groups: true,
      },
    })

    if (!typebot) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Typebot not found' })
    }

    const outgoingEdgeIds: (string | null)[] = []
    const invalidGroups: string[] = []

    if (Array.isArray(typebot.groups)) {
      ;(typebot.groups as Group[]).forEach((group) => {
        if ('blocks' in group && Array.isArray(group.blocks)) {
          const groupOutgoingEdgeIds = group.blocks
            .filter((block) => block.type.toLowerCase() === 'condition')
            .map((block) => block.outgoingEdgeId ?? null)

          outgoingEdgeIds.push(...groupOutgoingEdgeIds)

          if (groupOutgoingEdgeIds.includes(null)) {
            invalidGroups.push(group.title)
          }
        }
      })
    }

    const isValid = invalidGroups.length === 0

    return { isValid, outgoingEdgeIds, invalidGroups }
  })
