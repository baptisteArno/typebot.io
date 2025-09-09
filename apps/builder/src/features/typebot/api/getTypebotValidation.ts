import { publicProcedure } from '@/helpers/server/trpc'
import prisma from '@typebot.io/lib/prisma'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import {
  ValidationErrorItem,
  validationErrorSchema,
} from '../constants/errorTypes'
import {
  Group,
  Block,
  TypebotLinkBlock,
  typebotSchema,
  Edge,
} from '@typebot.io/schemas'
import { LogicBlockType } from '@typebot.io/schemas/features/blocks/logic/constants'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'
import type { ConditionBlock } from '@typebot.io/schemas/features/blocks/logic/condition'

const typebotValidationSchema = z.union([
  z.object({
    typebotId: z.string().describe('Typebot id to be validated'),
    typebot: z.undefined().optional(),
  }),
  z.object({
    typebotId: z.undefined().optional(),
    typebot: typebotSchema.describe('Typebot object to be validated directly'),
  }),
])

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

const missingTextBetweenInputBlocks = (groups: Group[], edges: Edge[]) => {
  // Rule: Along any path starting from a start event, between 2 data collection InputBlocks there must be at least one text display block (type === 'text').
  // If 2 InputBlocks appear consecutively (possibly across groups) without an intervening text block, flag the group containing the second InputBlock.
  const inputBlockTypes = new Set<string>(Object.values(InputBlockType))
  const groupMap = new Map<string, Group>(groups.map((g) => [g.id, g]))

  const blockIdToTargetGroup = new Map<string, string>()
  edges.forEach((e) => {
    if (
      'blockId' in e.from &&
      e.from.blockId &&
      'groupId' in e.to &&
      e.to.groupId
    ) {
      blockIdToTargetGroup.set(e.from.blockId, e.to.groupId)
    }
  })

  const startGroupIds = edges
    .filter(
      (e) =>
        'eventId' in e.from &&
        e.from.eventId &&
        'groupId' in e.to &&
        e.to.groupId
    )
    .map((e) => ('groupId' in e.to ? e.to.groupId : undefined))
    .filter((g): g is string => typeof g === 'string')

  // Helper: get first block of a group
  const firstBlockOf = (groupId: string): Block | undefined => {
    const g = groupMap.get(groupId)
    if (!g || !hasBlocks(g) || g.blocks.length === 0) return undefined
    return g.blocks[0]
  }

  // Helper: next blocks from current block (sequential + outgoing edge)
  const nextBlocks = (
    group: Group,
    blockIndex: number
  ): { block: Block; group: Group }[] => {
    const results: { block: Block; group: Group }[] = []
    // Sequential next in same group
    if (blockIndex + 1 < group.blocks.length) {
      results.push({ block: group.blocks[blockIndex + 1], group })
    }
    // Edge-based transition
    const current = group.blocks[blockIndex]
    if (current.outgoingEdgeId) {
      const edge = edges.find((e) => e.id === current.outgoingEdgeId)
      if (edge?.to.groupId) {
        const fb = firstBlockOf(edge.to.groupId)
        const targetGroup = groupMap.get(edge.to.groupId)
        if (fb && targetGroup) results.push({ block: fb, group: targetGroup })
      }
    }
    return results
  }

  const invalidGroupIds = new Set<string>()

  type QueueItem = {
    block: Block
    group: Group
    needTextBeforeNextInput: boolean // true if last encountered input lacked an intervening text
  }

  const enqueueStarts = (): QueueItem[] => {
    const items: QueueItem[] = []
    startGroupIds.forEach((gid) => {
      const fb = firstBlockOf(gid)
      const g = groupMap.get(gid)
      if (fb && g)
        items.push({ block: fb, group: g, needTextBeforeNextInput: false })
    })
    return items
  }

  const visited = new Set<string>() // key = block.id + '|' + (needTextBeforeNextInput?1:0)
  const queue: QueueItem[] = enqueueStarts()

  while (queue.length) {
    const { block, group, needTextBeforeNextInput } = queue.shift() as QueueItem
    const stateKey = `${block.id}|${needTextBeforeNextInput ? 1 : 0}`
    if (visited.has(stateKey)) continue
    visited.add(stateKey)

    let nextNeedText = needTextBeforeNextInput

    if (block.type === 'text') {
      nextNeedText = false
    } else if (inputBlockTypes.has(block.type)) {
      if (needTextBeforeNextInput) {
        invalidGroupIds.add(group.id)
        // We still continue traversal to discover additional violations
      }
      nextNeedText = true
    }

    const groupBlocks = group.blocks
    const idx = groupBlocks.findIndex((b) => b.id === block.id)
    if (idx !== -1) {
      const successors = nextBlocks(group, idx)
      successors.forEach(({ block: nb, group: ng }) => {
        queue.push({
          block: nb,
          group: ng,
          needTextBeforeNextInput: nextNeedText,
        })
      })
    }
  }

  return Array.from(invalidGroupIds).map<ValidationErrorItem>((groupId) => ({
    type: 'missingTextBetweenInputBlocks',
    groupId,
  }))
}

export const getTypebotValidation = publicProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/typebots/{typebotId}/validate',
      protect: true,
      summary: 'Validate a typebot',
      description:
        'Validate a typebot by ID or by providing the typebot object directly. Either typebotId or typebot must be provided.',
      tags: ['Typebot'],
    },
  })
  .input(typebotValidationSchema)
  .output(responseSchema)
  .query(async ({ input }) => {
    let typebot: { groups: unknown; edges: unknown } | null = null

    if (input.typebot) {
      typebot = {
        groups: input.typebot.groups,
        edges: input.typebot.edges,
      }
    } else if (input.typebotId) {
      typebot = await prisma.typebot.findFirst({
        where: {
          id: input.typebotId,
        },
        select: {
          groups: true,
          edges: true,
        },
      })

      if (!typebot) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Typebot not found' })
      }
    } else {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Either typebotId or typebot must be provided',
      })
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
      ...missingTextBetweenInputBlocks(
        typebot.groups as Group[],
        (typebot.edges as Edge[]) || []
      ),
    ]

    const isValid = errors.length === 0

    return {
      isValid,
      errors: errors,
    }
  })
