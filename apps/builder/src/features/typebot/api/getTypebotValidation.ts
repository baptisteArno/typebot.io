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
import {
  isConditionBlock,
  isTextBubbleBlock,
} from '@typebot.io/schemas/helpers'

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

const isTypebotLinkBlock = (block: Block): block is TypebotLinkBlock =>
  block.type === LogicBlockType.TYPEBOT_LINK

const isClaudiaBlock = (block: Block): boolean =>
  block.type.toLowerCase() === 'claudia'

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

const validateTextBeforeClaudia = (groups: Group[], edges: Edge[]) => {
  const invalidGroups: string[] = []
  const inputBlockTypes = new Set<string>(Object.values(InputBlockType))
  const groupMap = new Map<string, Group>(groups.map((g) => [g.id, g]))

  // Pre-index edges by from.blockId for quick lookup
  const edgesByFromBlock = new Map<string, Edge[]>()
  edges.forEach((e) => {
    if ('blockId' in e.from && typeof e.from.blockId === 'string') {
      const bid = e.from.blockId
      const list = edgesByFromBlock.get(bid) || []
      list.push(e)
      edgesByFromBlock.set(bid, list)
    }
  })

  const findBlockInGroup = (
    group: Group,
    blockId?: string
  ): Block | undefined => {
    if (!blockId) return group.blocks.length > 0 ? group.blocks[0] : undefined
    return (
      group.blocks.find((b) => b.id === blockId) ||
      (group.blocks.length > 0 ? group.blocks[0] : undefined)
    )
  }

  const getNextBlocks = (
    group: Group,
    blockIndex: number
  ): { block: Block; group: Group }[] => {
    const results: { block: Block; group: Group }[] = []
    // Sequential next
    if (blockIndex + 1 < group.blocks.length) {
      results.push({ block: group.blocks[blockIndex + 1], group })
    }
    // Outgoing edges
    const current = group.blocks[blockIndex]
    const relatedEdges = edgesByFromBlock.get(current.id) || []
    relatedEdges.forEach((edge) => {
      if ('groupId' in edge.to && typeof edge.to.groupId === 'string') {
        const targetGroupId = edge.to.groupId
        const targetGroup = groupMap.get(targetGroupId)
        if (!targetGroup) return
        const targetBlockId =
          'blockId' in edge.to && typeof edge.to.blockId === 'string'
            ? edge.to.blockId
            : undefined
        const targetBlock = findBlockInGroup(targetGroup, targetBlockId)
        if (targetBlock)
          results.push({ block: targetBlock, group: targetGroup })
      }
    })
    return results
  }

  const getPreviousBlocks = (
    targetGroup: Group,
    targetBlockIndex: number
  ): { block: Block; group: Group }[] => {
    const results: { block: Block; group: Group }[] = []

    // Sequential previous
    if (targetBlockIndex > 0) {
      results.push({
        block: targetGroup.blocks[targetBlockIndex - 1],
        group: targetGroup,
      })
    }

    // Incoming edges
    const targetBlock = targetGroup.blocks[targetBlockIndex]
    edges.forEach((edge) => {
      if (
        'groupId' in edge.to &&
        typeof edge.to.groupId === 'string' &&
        edge.to.groupId === targetGroup.id
      ) {
        // Check if this edge targets our specific block or the group start
        const edgeTargetsThisBlock =
          ('blockId' in edge.to && edge.to.blockId === targetBlock.id) ||
          (!('blockId' in edge.to) && targetBlockIndex === 0)

        if (
          edgeTargetsThisBlock &&
          'blockId' in edge.from &&
          typeof edge.from.blockId === 'string'
        ) {
          // Find the source block
          const sourceBlockId = edge.from.blockId
          groups.forEach((sourceGroup) => {
            const sourceBlockIndex = sourceGroup.blocks.findIndex(
              (b) => b.id === sourceBlockId
            )
            if (sourceBlockIndex !== -1) {
              results.push({
                block: sourceGroup.blocks[sourceBlockIndex],
                group: sourceGroup,
              })
            }
          })
        }
      }
    })

    return results
  }

  // Find all Claudia blocks and validate each one
  groups.forEach((group) => {
    if (!hasBlocks(group)) return

    group.blocks.forEach((block, blockIndex) => {
      if (!isClaudiaBlock(block)) return

      let hasValidText = false
      const visited = new Set<string>()

      // Check forward path (blocks after Claudia)
      const checkForwardPath = (
        currentBlock: Block,
        currentGroup: Group,
        currentIndex: number
      ) => {
        const nextBlocks = getNextBlocks(currentGroup, currentIndex)

        for (const { block: nextBlock, group: nextGroup } of nextBlocks) {
          const visitKey = `${nextGroup.id}-${nextBlock.id}`
          if (visited.has(visitKey)) continue
          visited.add(visitKey)

          if (isTextBubbleBlock(nextBlock)) {
            return true
          }

          if (inputBlockTypes.has(nextBlock.type)) {
            // Stop searching this path when we hit an input block
            continue
          }

          const nextIndex = nextGroup.blocks.findIndex(
            (b) => b.id === nextBlock.id
          )
          if (
            nextIndex !== -1 &&
            checkForwardPath(nextBlock, nextGroup, nextIndex)
          ) {
            return true
          }
        }
        return false
      }

      // Check backward path (blocks before Claudia)
      const checkBackwardPath = (
        currentBlock: Block,
        currentGroup: Group,
        currentIndex: number
      ) => {
        const prevBlocks = getPreviousBlocks(currentGroup, currentIndex)

        for (const { block: prevBlock, group: prevGroup } of prevBlocks) {
          const visitKey = `${prevGroup.id}-${prevBlock.id}-back`
          if (visited.has(visitKey)) continue
          visited.add(visitKey)

          if (isTextBubbleBlock(prevBlock)) {
            return true
          }

          if (inputBlockTypes.has(prevBlock.type)) {
            // Stop searching this path when we hit an input block
            continue
          }

          const prevIndex = prevGroup.blocks.findIndex(
            (b) => b.id === prevBlock.id
          )
          if (
            prevIndex !== -1 &&
            checkBackwardPath(prevBlock, prevGroup, prevIndex)
          ) {
            return true
          }
        }
        return false
      }

      // Check both directions
      hasValidText =
        checkForwardPath(block, group, blockIndex) ||
        checkBackwardPath(block, group, blockIndex)

      if (!hasValidText) {
        invalidGroups.push(group.id)
      }
    })
  })

  return invalidGroups
}

const missingTextBetweenInputBlocks = (groups: Group[], edges: Edge[]) => {
  // Rule: From any start event, along every possible execution path, between 2 input (data collection) blocks there must be at least one text block.
  // We traverse the whole graph (including branching via Condition items) until paths are exhausted.
  const inputBlockTypes = new Set<string>(Object.values(InputBlockType))
  const groupMap = new Map<string, Group>(groups.map((g) => [g.id, g]))

  // Start groups are those targeted by an edge whose origin is a start event
  const startGroupIds = edges
    .filter(
      (e): e is Edge & { from: { eventId: string }; to: { groupId: string } } =>
        'eventId' in e.from &&
        typeof e.from.eventId === 'string' &&
        'groupId' in e.to &&
        typeof e.to.groupId === 'string'
    )
    .map((e) => e.to.groupId)

  const firstBlockOf = (groupId: string): Block | undefined => {
    const g = groupMap.get(groupId)
    if (!g || !hasBlocks(g) || g.blocks.length === 0) return undefined
    return g.blocks[0]
  }

  const findBlockInGroup = (
    group: Group,
    blockId?: string
  ): Block | undefined => {
    if (!blockId) return firstBlockOf(group.id)
    return group.blocks.find((b) => b.id === blockId) || firstBlockOf(group.id)
  }

  // Pre-index edges by from.blockId for quick lookup (includes item edges)
  const edgesByFromBlock = new Map<string, Edge[]>()
  edges.forEach((e) => {
    if ('blockId' in e.from && typeof e.from.blockId === 'string') {
      const bid = e.from.blockId
      const list = edgesByFromBlock.get(bid) || []
      list.push(e)
      edgesByFromBlock.set(bid, list)
    }
  })

  const nextBlocks = (
    group: Group,
    blockIndex: number
  ): { block: Block; group: Group }[] => {
    const results: { block: Block; group: Group }[] = []
    // Sequential next
    if (blockIndex + 1 < group.blocks.length) {
      results.push({ block: group.blocks[blockIndex + 1], group })
    }
    // Outgoing edges (including condition item edges)
    const current = group.blocks[blockIndex]
    const relatedEdges = edgesByFromBlock.get(current.id) || []
    relatedEdges.forEach((edge) => {
      if ('groupId' in edge.to && typeof edge.to.groupId === 'string') {
        const targetGroupId = edge.to.groupId
        const targetGroup = groupMap.get(targetGroupId)
        if (!targetGroup) return
        const targetBlockId =
          'blockId' in edge.to && typeof edge.to.blockId === 'string'
            ? edge.to.blockId
            : undefined
        const targetBlock = findBlockInGroup(targetGroup, targetBlockId)
        if (targetBlock)
          results.push({ block: targetBlock, group: targetGroup })
      }
    })
    return results
  }

  const invalidGroupIds = new Set<string>()

  type QueueItem = {
    block: Block
    group: Group
    needTextBeforeNextInput: boolean
  }

  const initialQueue: QueueItem[] = []
  startGroupIds.forEach((gid) => {
    const fb = firstBlockOf(gid)
    const g = groupMap.get(gid)
    if (fb && g)
      initialQueue.push({ block: fb, group: g, needTextBeforeNextInput: false })
  })

  const visited = new Set<string>() // block.id|stateFlag
  const queue: QueueItem[] = initialQueue

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
      }
      nextNeedText = true
    }

    const idx = group.blocks.findIndex((b) => b.id === block.id)
    if (idx !== -1) {
      nextBlocks(group, idx).forEach(({ block: nb, group: ng }) => {
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

    const missingTextBeforeClaudia = validateTextBeforeClaudia(
      typebot.groups,
      (typebot.edges as Edge[]) || []
    )
    const missingTextBeforeClaudiaErrors: ValidationErrorItem[] =
      missingTextBeforeClaudia.map((groupId) => ({
        type: 'missingTextBeforeClaudia',
        groupId,
      }))

    const errors = [
      ...invalidGroupsErrors,
      ...brokenLinksErrors,
      ...missingTextBeforeClaudiaErrors,
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
