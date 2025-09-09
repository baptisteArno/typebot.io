import { publicProcedure } from '@/helpers/server/trpc'
import prisma from '@typebot.io/lib/prisma'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import {
  ValidationErrorItem,
  validationErrorSchema,
} from '../constants/errorTypes'
import { Group, Block, TypebotLinkBlock } from '@typebot.io/schemas'
import { LogicBlockType } from '@typebot.io/schemas/features/blocks/logic/constants'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'
import type { ConditionBlock } from '@typebot.io/schemas/features/blocks/logic/condition'

const typebotValidationSchema = z.object({
  typebotId: z.string().describe('Typebot id to be validated'),
})

const responseSchema = validationErrorSchema

const isGroupArray = (groups: unknown): groups is Group[] =>
  Array.isArray(groups)
const hasBlocks = (group: Group): boolean =>
  'blocks' in group && Array.isArray(group.blocks)
const isConditionBlock = (block: Block): block is ConditionBlock =>
  block.type === LogicBlockType.CONDITION

const isTypebotLinkBlock = (block: Block): block is TypebotLinkBlock =>
  block.type === LogicBlockType.TYPEBOT_LINK

const isClaudiaBlock = (block: Block): boolean =>
  block.type.toLowerCase() === 'claudia'

const isTextBlock = (block: Block): boolean =>
  block.type === InputBlockType.TEXT

const validateConditionalBlocks = (groups: Group[]) => {
  const outgoingEdgeIds: (string | null)[] = []
  const invalidGroups: string[] = []

  groups.forEach((group) => {
    if (hasBlocks(group)) {
      const conditionalBlocks = group.blocks.filter(isConditionBlock)

      conditionalBlocks.forEach((block) => {
        const blockOutgoingEdgeId = block.outgoingEdgeId ?? null
        outgoingEdgeIds.push(blockOutgoingEdgeId)

        const itemOutgoingEdgeIds = block.items.map(
          (item) => item.outgoingEdgeId ?? null
        )
        outgoingEdgeIds.push(...itemOutgoingEdgeIds)

        if (
          itemOutgoingEdgeIds.includes(null) ||
          blockOutgoingEdgeId === null
        ) {
          invalidGroups.push(group.id)
        }
      })
    }
  })

  return { outgoingEdgeIds, invalidGroups }
}

const validateTypebotLinks = async (groups: Group[]) => {
  const brokenLinks: { groupId: string; typebotName: string }[] = []

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
                groupId: group.id,
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
        invalidGroups.push(group.id)
      }
    }
  })

  return invalidGroups
}

const collectDataAfterClaudia = (groups: Group[]): ValidationErrorItem[] => {
  // Rule: after any "ClaudIA" block there must NOT be any data collection block (any InputBlock) afterwards
  const inputBlockTypes = new Set<string>(Object.values(InputBlockType))

  return groups
    .filter(hasBlocks)
    .filter((group) => {
      const { blocks } = group
      // Collect indices where ClaudIA appears
      const claudiaIndexes = blocks
        .map((b, idx) => (isClaudiaBlock(b) ? idx : -1))
        .filter((idx) => idx !== -1)
      if (claudiaIndexes.length === 0) return false
      // For each ClaudIA occurrence, check if any subsequent block is an InputBlock
      return claudiaIndexes.some((idx) =>
        blocks.slice(idx + 1).some((b) => inputBlockTypes.has(b.type))
      )
    })
    .map<ValidationErrorItem>((group) => ({
      type: 'collectDataAfterClaudia',
      groupId: group.id,
    }))
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
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Invalid groups structure',
      })
    }

    const { invalidGroups } = validateConditionalBlocks(typebot.groups)

    const invalidGroupsErrors: ValidationErrorItem[] = invalidGroups.map(
      (groupId) => ({
        type: 'conditionalBlocks',
        groupId,
      })
    )

    const brokenLinks = await validateTypebotLinks(typebot.groups)
    const brokenLinksErrors: ValidationErrorItem[] = brokenLinks.map((b) => ({
      type: 'brokenLinks',
      groupId: b.groupId,
      typebotName: b.typebotName,
    }))

    const missingTextBeforeClaudia = validateTextBeforeClaudia(typebot.groups)
    const missingTextBeforeClaudiaErrors: ValidationErrorItem[] =
      missingTextBeforeClaudia.map((groupId) => ({
        type: 'missingTextBeforeClaudia',
        groupId,
      }))

    const collectDataAfterClaudiaErrors = collectDataAfterClaudia(
      typebot.groups
    )

    const errors = [
      ...invalidGroupsErrors,
      ...brokenLinksErrors,
      ...missingTextBeforeClaudiaErrors,
      ...collectDataAfterClaudiaErrors,
    ]

    const isValid = errors.length === 0

    return {
      isValid,
      errors: errors,
    }
  })
