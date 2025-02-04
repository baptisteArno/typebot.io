import { publicProcedure } from '@/helpers/server/trpc'
import prisma from '@typebot.io/lib/prisma'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

type Block = {
  id: string
  type: string
  outgoingEdgeId?: string | null
  options?: { typebotId?: string }
}
type Group = {
  title: string
  blocks: Block[]
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Edge = {
  id: string
  to: {
    blockId: string
    groupId: string
  }
  from: {
    blockId: string
  }
}

const typebotValidationSchema = z.object({
  typebotId: z.string().describe('Typebot id to be validated'),
})

const responseSchema = z.object({
  isValid: z.boolean(),
  outgoingEdgeIds: z.array(z.string().nullable()),
  invalidGroups: z.array(z.string()),
  brokenLinks: z.array(
    z.object({
      groupName: z.string(),
      typebotName: z.string(),
    })
  ),
  invalidTextBeforeClaudia: z.array(z.string()),
})

const isGroupArray = (groups: unknown): groups is Group[] =>
  Array.isArray(groups)
const hasBlocks = (group: Group): boolean =>
  'blocks' in group && Array.isArray(group.blocks)
const isConditionBlock = (block: Block): boolean =>
  block.type.toLowerCase() === 'condition'

const isTypebotLinkBlock = (block: Block): boolean =>
  block.type.toLowerCase() === 'typebot link' &&
  block.options?.typebotId !== undefined

const isClaudiaBlock = (block: Block): boolean =>
  block.type.toLowerCase() === 'claudia'

const isTextBlock = (block: Block): boolean =>
  block.type.toLowerCase() === 'text'

const validateOutgoingEdges = (groups: Group[]) => {
  const outgoingEdgeIds: (string | null)[] = []
  const invalidGroups: string[] = []

  groups.forEach((group) => {
    if (hasBlocks(group)) {
      const groupOutgoingEdgeIds = group.blocks
        .filter(isConditionBlock)
        .map((block) => block.outgoingEdgeId ?? null)

      outgoingEdgeIds.push(...groupOutgoingEdgeIds)

      if (groupOutgoingEdgeIds.includes(null)) {
        invalidGroups.push(group.title)
      }
    }
  })

  return { outgoingEdgeIds, invalidGroups }
}

const validateTypebotLinks = async (groups: Group[]) => {
  const brokenLinks: { groupName: string; typebotName: string }[] = []

  for (const group of groups) {
    if (hasBlocks(group)) {
      for (const block of group.blocks.filter(isTypebotLinkBlock)) {
        const typebotId = block.options?.typebotId
        if (typebotId) {
          const publicTypebot = await prisma.publicTypebot.findUnique({
            where: { typebotId },
          })

          if (!publicTypebot) {
            const typebotRecord = await prisma.typebot.findUnique({
              where: { id: typebotId },
              select: { name: true },
            })

            if (typebotRecord?.name) {
              brokenLinks.push({
                groupName: group.title,
                typebotName: typebotRecord.name,
              })
            }
          }
        }
      }
    }
  }

  return brokenLinks
}

const validateTextBeforeClaudia = (groups: Group[]) => {
  const invalidGroups: string[] = []

  groups.forEach((group) => {
    if (hasBlocks(group)) {
      let foundTextBlock = false
      let foundClaudiaBlock = false

      for (const block of group.blocks) {
        if (isClaudiaBlock(block)) {
          foundClaudiaBlock = true
        }
        if (isTextBlock(block)) {
          foundTextBlock = true
        }
      }

      if (foundClaudiaBlock && !foundTextBlock) {
        invalidGroups.push(group.title)
      }
    }
  })

  return invalidGroups
}

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
        edges: true,
      },
    })

    if (!typebot) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Typebot not found' })
    }

    if (!isGroupArray(typebot.groups)) {
      return {
        isValid: false,
        outgoingEdgeIds: [],
        invalidGroups: [],
        brokenLinks: [],
        invalidTextBeforeClaudia: [],
      }
    }

    const { outgoingEdgeIds, invalidGroups } = validateOutgoingEdges(
      typebot.groups
    )
    const brokenLinks = await validateTypebotLinks(typebot.groups)
    const invalidTextBeforeClaudia = validateTextBeforeClaudia(typebot.groups)

    const isValid =
      invalidGroups.length === 0 &&
      brokenLinks.length === 0 &&
      invalidTextBeforeClaudia.length === 0

    return {
      isValid,
      outgoingEdgeIds,
      invalidGroups,
      brokenLinks,
      invalidTextBeforeClaudia,
    }
  })
