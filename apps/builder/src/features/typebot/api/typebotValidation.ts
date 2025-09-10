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
  Edge,
  edgeSchema,
  groupV5Schema,
  groupV6Schema,
} from '@typebot.io/schemas'
import { LogicBlockType } from '@typebot.io/schemas/features/blocks/logic/constants'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'
import {
  isConditionBlock,
  isTextBubbleBlock,
} from '@typebot.io/schemas/helpers'
import { JumpBlock } from '@typebot.io/schemas/features/blocks/logic/jump'

const responseSchema = validationErrorSchema

const hasBlocks = (group: Group): boolean =>
  'blocks' in group && Array.isArray(group.blocks)

const isTypebotLinkBlock = (block: Block): block is TypebotLinkBlock =>
  block.type === LogicBlockType.TYPEBOT_LINK

const isClaudiaBlock = (block: Block): boolean =>
  block.type.toLowerCase() === 'claudia'

const isJumpBlock = (block: Block): block is JumpBlock =>
  block.type === LogicBlockType.JUMP

// Helpers restaurados
const validateFlowBranchesHaveClaudia = (groups: Group[], edges: Edge[]) => {
  const invalidGroupIds = new Set<string>()
  const groupMap = new Map<string, Group>(groups.map((g) => [g.id, g]))

  const edgesByFromBlock = new Map<string, Edge[]>()
  edges.forEach((e) => {
    if ('blockId' in e.from && typeof e.from.blockId === 'string') {
      const bid = e.from.blockId
      const list = edgesByFromBlock.get(bid) || []
      list.push(e)
      edgesByFromBlock.set(bid, list)
    }
  })

  const startGroupIds = edges
    .filter(
      (e): e is Edge & { from: { eventId: string }; to: { groupId: string } } =>
        'eventId' in e.from &&
        typeof e.from.eventId === 'string' &&
        'groupId' in e.to &&
        typeof e.to.groupId === 'string'
    )
    .map((e) => e.to.groupId)

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

    if (blockIndex + 1 < group.blocks.length) {
      results.push({ block: group.blocks[blockIndex + 1], group })
    }

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

  startGroupIds.forEach((startGroupId) => {
    const startGroup = groupMap.get(startGroupId)
    if (!startGroup || !hasBlocks(startGroup)) return

    const visited = new Set<string>()
    const pathsToCheck: { block: Block; group: Group; hasClaudia: boolean }[] =
      []

    const firstBlock = startGroup.blocks[0]
    pathsToCheck.push({
      block: firstBlock,
      group: startGroup,
      hasClaudia: false,
    })

    while (pathsToCheck.length > 0) {
      const { block, group, hasClaudia } = pathsToCheck.shift()!
      const visitKey = `${group.id}-${block.id}`

      if (visited.has(visitKey)) continue
      visited.add(visitKey)

      let currentHasClaudia = hasClaudia
      if (
        isClaudiaBlock(block) ||
        isJumpBlock(block) ||
        isTypebotLinkBlock(block)
      ) {
        currentHasClaudia = true
      }

      const blockIndex = group.blocks.findIndex((b) => b.id === block.id)
      if (blockIndex === -1) continue

      const nextBlocks = getNextBlocks(group, blockIndex)

      if (nextBlocks.length === 0) {
        if (!currentHasClaudia) {
          invalidGroupIds.add(group.id)
        }
      } else {
        nextBlocks.forEach(({ block: nextBlock, group: nextGroup }) => {
          pathsToCheck.push({
            block: nextBlock,
            group: nextGroup,
            hasClaudia: currentHasClaudia,
          })
        })
      }
    }
  })

  return Array.from(invalidGroupIds)
}

const validateConditionalBlocks = (groups: Group[], edges: Edge[]) => {
  const outgoingEdgeIds: (string | null)[] = []
  const invalidGroups: string[] = []
  const existingEdgeIds = new Set(edges.map((edge) => edge.id))

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
        const actualBlockIndex = group.blocks.findIndex(
          (b) => b.id === block.id
        )
        const isLastBlock = actualBlockIndex === group.blocks.length - 1
        const shouldValidateBlockEdge =
          isLastBlock && blockOutgoingEdgeId === null
        const hasInvalidBlockEdge =
          blockOutgoingEdgeId !== null &&
          !existingEdgeIds.has(blockOutgoingEdgeId)
        const hasInvalidItemEdges = itemOutgoingEdgeIds.some(
          (edgeId) => edgeId !== null && !existingEdgeIds.has(edgeId)
        )
        if (
          itemOutgoingEdgeIds.includes(null) ||
          shouldValidateBlockEdge ||
          hasInvalidBlockEdge ||
          hasInvalidItemEdges
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
    if (blockIndex + 1 < group.blocks.length) {
      results.push({ block: group.blocks[blockIndex + 1], group })
    }
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
    if (targetBlockIndex > 0) {
      results.push({
        block: targetGroup.blocks[targetBlockIndex - 1],
        group: targetGroup,
      })
    }
    const targetBlock = targetGroup.blocks[targetBlockIndex]
    edges.forEach((edge) => {
      if (
        'groupId' in edge.to &&
        typeof edge.to.groupId === 'string' &&
        edge.to.groupId === targetGroup.id
      ) {
        const edgeTargetsThisBlock =
          ('blockId' in edge.to && edge.to.blockId === targetBlock.id) ||
          (!('blockId' in edge.to) && targetBlockIndex === 0)
        if (
          edgeTargetsThisBlock &&
          'blockId' in edge.from &&
          typeof edge.from.blockId === 'string'
        ) {
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

  groups.forEach((group) => {
    if (!hasBlocks(group)) return
    group.blocks.forEach((block, blockIndex) => {
      if (!isClaudiaBlock(block)) return
      let hasValidText = false
      const visited = new Set<string>()
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

const missingTextBetweenInputBlocks = (
  groups: Group[],
  edges: Edge[],
  groupTitleMap?: Map<string, string>
) => {
  const inputBlockTypes = new Set<string>(Object.values(InputBlockType))
  const groupMap = new Map<string, Group>(groups.map((g) => [g.id, g]))
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
    if (blockIndex + 1 < group.blocks.length) {
      results.push({ block: group.blocks[blockIndex + 1], group })
    }
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
  const visited = new Set<string>()
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
    message: getErrorMessage(
      'missingTextBetweenInputBlocks',
      groupTitleMap?.get(groupId)
    ),
  }))
}

const getErrorMessage = (type: string, groupTitle?: string): string => {
  const errorMessages = {
    conditionalBlocks: 'Incomplete Conditions',
    brokenLinks: 'Broken Links',
    missingTextBeforeClaudia: 'Missing text alongside ClaudIA block',
    missingTextBetweenInputBlocks: 'Missing text between input blocks',
    missingClaudiaInFlowBranches: 'Missing ClaudIA block in flow branches',
  }
  const baseMessage =
    errorMessages[type as keyof typeof errorMessages] || 'Validation Error'
  return groupTitle ? `${groupTitle} - ${baseMessage}` : baseMessage
}

const createGroupTitleMap = (groups: Group[]): Map<string, string> => {
  return new Map(groups.map((group) => [group.id, group.title]))
}

const validateTypebot = async ({
  groups,
  edges,
}: {
  groups: Group[]
  edges: Edge[]
}) => {
  const safeEdges = (edges as Edge[]) || []
  const groupTitleMap = createGroupTitleMap(groups)
  const { invalidGroups } = validateConditionalBlocks(groups, safeEdges)
  const invalidGroupsErrors: ValidationErrorItem[] = invalidGroups.map(
    (groupId) => ({
      type: 'conditionalBlocks',
      groupId,
      message: getErrorMessage('conditionalBlocks', groupTitleMap.get(groupId)),
    })
  )
  const brokenLinks = await validateTypebotLinks(groups)
  const brokenLinksErrors: ValidationErrorItem[] = brokenLinks.map((b) => ({
    type: 'brokenLinks',
    groupId: b.groupId,
    message: getErrorMessage('brokenLinks', groupTitleMap.get(b.groupId)),
  }))
  const missingTextBeforeClaudia = validateTextBeforeClaudia(groups, safeEdges)
  const missingTextBeforeClaudiaErrors: ValidationErrorItem[] =
    missingTextBeforeClaudia.map((groupId) => ({
      type: 'missingTextBeforeClaudia',
      groupId,
      message: getErrorMessage(
        'missingTextBeforeClaudia',
        groupTitleMap.get(groupId)
      ),
    }))
  const missingClaudiaInFlowBranches = validateFlowBranchesHaveClaudia(
    groups,
    safeEdges
  )
  const missingClaudiaInFlowBranchesErrors: ValidationErrorItem[] =
    missingClaudiaInFlowBranches.map((groupId) => ({
      type: 'missingClaudiaInFlowBranches',
      groupId,
      message: getErrorMessage(
        'missingClaudiaInFlowBranches',
        groupTitleMap.get(groupId)
      ),
    }))
  const errors = [
    ...invalidGroupsErrors,
    ...brokenLinksErrors,
    ...missingTextBeforeClaudiaErrors,
    ...missingClaudiaInFlowBranchesErrors,
    ...missingTextBetweenInputBlocks(groups, safeEdges, groupTitleMap),
  ]
  return { isValid: errors.length === 0, errors }
}

export const getTypebotValidation = publicProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/typebots/{typebotId}/validate',
      protect: true,
      summary: 'Validate a typebot',
      description: 'Validate a typebot by ID.',
      tags: ['Typebot'],
    },
  })
  .input(
    z.object({
      typebotId: z.string().describe('Typebot id to be validated'),
    })
  )
  .output(responseSchema)
  .query(async ({ input }) => {
    const typebot = (await prisma.typebot.findFirst({
      where: { id: input.typebotId },
      select: { groups: true, edges: true },
    })) as { groups: Group[]; edges: Edge[] } | null

    if (!typebot) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Typebot not found' })
    }

    const { isValid, errors } = await validateTypebot(typebot)
    return { isValid, errors }
  })

export const postTypebotValidation = publicProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/typebots/{typebotId}/validate',
      protect: true,
      summary: 'Validate a typebot',
      description:
        'Validate a typebot by ID. Optionally provide the typebot object directly to override database lookup.',
      tags: ['Typebot'],
    },
  })
  .input(
    z.object({
      typebot: z
        .object({
          edges: z.array(edgeSchema),
          groups: z.array(groupV6Schema.or(groupV5Schema)),
        })
        .describe(
          'Typebot object to be validated directly (optional override)'
        ),
    })
  )
  .output(responseSchema)
  .mutation(async ({ input }) => {
    const { groups, edges } = input.typebot
    return await validateTypebot({ groups, edges })
  })
