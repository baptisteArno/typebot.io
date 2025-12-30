import { publicProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import prisma from '@typebot.io/lib/prisma'
import {
  Block,
  Edge,
  edgeSchema,
  Group,
  groupV5Schema,
  groupV6Schema,
  TypebotLinkBlock,
  Variable,
  variableSchema,
} from '@typebot.io/schemas'
import {
  isClaudiaAnswerTicketBlock,
  isClaudiaBlock,
} from '@typebot.io/schemas/features/blocks/forged/helpers'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'
import { LogicBlockType } from '@typebot.io/schemas/features/blocks/logic/constants'
import { JumpBlock } from '@typebot.io/schemas/features/blocks/logic/jump'
import {
  isConditionBlock,
  isTextBubbleBlock,
} from '@typebot.io/schemas/helpers'
import { z } from 'zod'
import {
  ValidationErrorItem,
  validationErrorSchema,
} from '../constants/errorTypes'

const PREFILLED_VARIABLES = [
  'helpdeskId',
  'cloudChatId',
  'activeIntent',
  'channelType',
  'language',
  'createdAt',
  'frustrationScore',
  'abKey',
  'lastUserMessages',
  'messages',
]

const responseSchema = validationErrorSchema

const hasBlocks = (group: Group): boolean =>
  'blocks' in group && Array.isArray(group.blocks)

const isTypebotLinkBlock = (block: Block): block is TypebotLinkBlock =>
  block.type === LogicBlockType.TYPEBOT_LINK

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
  const groupMap = new Map<string, Group>(groups.map((g) => [g.id, g]))

  const edgesByFromBlock = new Map<string, Edge[]>()
  const edgesByToGroup = new Map<string, Edge[]>()

  edges.forEach((e) => {
    if ('blockId' in e.from && typeof e.from.blockId === 'string') {
      const bid = e.from.blockId
      const list = edgesByFromBlock.get(bid) || []
      list.push(e)
      edgesByFromBlock.set(bid, list)
    }

    if ('groupId' in e.to && typeof e.to.groupId === 'string') {
      const gid = e.to.groupId
      const list = edgesByToGroup.get(gid) || []
      list.push(e)
      edgesByToGroup.set(gid, list)
    }
  })

  const hasTextInGroup = (group: Group): boolean => {
    return group.blocks.some((block) => isTextBubbleBlock(block))
  }

  const isInputBlock = (block: Block): boolean => {
    return (Object.values(InputBlockType) as string[]).includes(block.type)
  }

  const hasAccessibleTextInGroup = (group: Group): boolean => {
    const textBlocks = group.blocks.filter((block) => isTextBubbleBlock(block))
    const claudiaBlocks = group.blocks.filter(
      (block) => isClaudiaBlock(block) && !isClaudiaAnswerTicketBlock(block)
    )

    if (textBlocks.length === 0 || claudiaBlocks.length === 0) {
      return false
    }

    return claudiaBlocks.some((claudiaBlock) => {
      const claudiaIndex = group.blocks.findIndex(
        (b) => b.id === claudiaBlock.id
      )

      for (let i = 0; i < claudiaIndex; i++) {
        const block = group.blocks[i]
        if (isTextBubbleBlock(block)) {
          const hasBlockingInput = group.blocks
            .slice(i + 1, claudiaIndex)
            .some((b) => isInputBlock(b))
          if (!hasBlockingInput) {
            return true
          }
        }
      }

      for (let i = claudiaIndex + 1; i < group.blocks.length; i++) {
        const block = group.blocks[i]
        if (isTextBubbleBlock(block)) {
          return true
        }
      }

      return false
    })
  }

  const edgeSkipsTextInGroup = (group: Group): boolean => {
    const incomingEdges = edgesByToGroup.get(group.id) || []

    return incomingEdges.some((edge) => {
      if ('blockId' in edge.to && typeof edge.to.blockId === 'string') {
        const targetBlock = group.blocks.find((b) => b.id === edge.to.blockId)
        if (targetBlock) {
          const targetIndex = group.blocks.findIndex(
            (b) => b.id === edge.to.blockId
          )

          if (targetIndex > 0) {
            const skippedBlocks = group.blocks.slice(0, targetIndex)
            const hasSkippedText = skippedBlocks.some((b) =>
              isTextBubbleBlock(b)
            )

            if (hasSkippedText) {
              const remainingBlocks = group.blocks.slice(targetIndex)
              const hasClaudiaAfter = remainingBlocks.some(
                (b) => isClaudiaBlock(b) && !isClaudiaAnswerTicketBlock(b)
              )

              if (hasClaudiaAfter) {
                const hasAccessibleTextAfterTarget = remainingBlocks.some((b) =>
                  isTextBubbleBlock(b)
                )
                return !hasAccessibleTextAfterTarget
              }
            }
          }
        }
      }
      return false
    })
  }

  const getNextGroups = (group: Group, blockIndex?: number): Group[] => {
    const results: Group[] = []

    const blocksToCheck =
      blockIndex !== undefined ? [group.blocks[blockIndex]] : group.blocks

    blocksToCheck.forEach((block) => {
      if (!block) return

      const relatedEdges = edgesByFromBlock.get(block.id) || []
      relatedEdges.forEach((edge) => {
        if ('groupId' in edge.to && typeof edge.to.groupId === 'string') {
          const targetGroup = groupMap.get(edge.to.groupId)
          if (targetGroup && !results.includes(targetGroup)) {
            results.push(targetGroup)
          }
        }
      })
    })

    return results
  }

  const getPreviousGroups = (group: Group): Group[] => {
    const results: Group[] = []
    const incomingEdges = edgesByToGroup.get(group.id) || []

    incomingEdges.forEach((edge) => {
      if ('blockId' in edge.from && typeof edge.from.blockId === 'string') {
        const blockId = edge.from.blockId
        for (const [, g] of groupMap) {
          if (g.blocks.some((b) => b.id === blockId)) {
            if (!results.includes(g)) {
              results.push(g)
            }
            break
          }
        }
      }
    })

    return results
  }

  const hasTextInPath = (
    startGroup: Group,
    direction: 'forward' | 'backward',
    visited: Set<string> = new Set(),
    depth: number = 0,
    maxDepth: number = 3
  ): boolean => {
    if (depth > maxDepth || visited.has(startGroup.id)) {
      return false
    }

    visited.add(startGroup.id)

    if (
      depth === 0
        ? hasAccessibleTextInGroup(startGroup)
        : hasTextInGroup(startGroup)
    ) {
      return true
    }

    const hasBlockingInput = startGroup.blocks.some((block) =>
      isInputBlock(block)
    )
    if (hasBlockingInput && depth > 0) {
      return false
    }

    const connectedGroups =
      direction === 'forward'
        ? getNextGroups(startGroup)
        : getPreviousGroups(startGroup)

    return connectedGroups.some((group) =>
      hasTextInPath(group, direction, new Set(visited), depth + 1, maxDepth)
    )
  }

  groups.forEach((group) => {
    if (!hasBlocks(group)) return

    const hasClaudia = group.blocks.some(
      (block) => isClaudiaBlock(block) && !isClaudiaAnswerTicketBlock(block)
    )
    if (!hasClaudia) return

    if (edgeSkipsTextInGroup(group)) {
      invalidGroups.push(group.id)
      return
    }

    if (hasAccessibleTextInGroup(group)) {
      return
    }

    const nextGroups = getNextGroups(group)
    const prevGroups = getPreviousGroups(group)

    const hasTextInAdjacentGroups =
      nextGroups.some((g) => hasTextInGroup(g)) ||
      prevGroups.some((g) => hasTextInGroup(g))

    if (hasTextInAdjacentGroups) {
      return
    }

    const hasTextForward = hasTextInPath(group, 'forward')
    const hasTextBackward = hasTextInPath(group, 'backward')

    if (hasTextForward || hasTextBackward) {
      return
    }

    invalidGroups.push(group.id)
  })

  return invalidGroups
}

const missingTextBetweenInputBlocks = (
  variables: Variable[],
  groups: Group[],
  edges: Edge[],
  groupTitleMap?: Map<string, string>
) => {
  const inputBlockTypes = new Set<string>(Object.values(InputBlockType))
  const groupMap = new Map<string, Group>(groups.map((g) => [g.id, g]))

  const allVariables = new Map<string, string>()

  variables.forEach((variable: Variable) => {
    if (variable.id && variable.name) {
      allVariables.set(variable.id, variable.name)
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
    } else if (
      inputBlockTypes.has(block.type) &&
      !isPrefilledVariable(block, allVariables)
    ) {
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

const isPrefilledVariable = (
  block: Block,
  allVariables: Map<string, string>
): boolean => {
  if (block.type === 'text input') {
    const variableId = block?.options?.variableId
    const variableName = variableId && allVariables.get(variableId)

    return variableName && PREFILLED_VARIABLES.includes(variableName)
      ? true
      : false
  }
  return false
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
  variables,
  groups,
  edges,
  isSecondaryFlow = false,
}: {
  variables: Variable[]
  groups: Group[]
  edges: Edge[]
  isSecondaryFlow?: boolean
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

  let missingTextBeforeClaudiaErrors: ValidationErrorItem[] = []
  let missingClaudiaInFlowBranchesErrors: ValidationErrorItem[] = []
  let missingTextBetweenInputBlocksErrors: ValidationErrorItem[] = []

  if (!isSecondaryFlow) {
    const missingTextBeforeClaudia = validateTextBeforeClaudia(
      groups,
      safeEdges
    )
    missingTextBeforeClaudiaErrors = missingTextBeforeClaudia.map(
      (groupId) => ({
        type: 'missingTextBeforeClaudia',
        groupId,
        message: getErrorMessage(
          'missingTextBeforeClaudia',
          groupTitleMap.get(groupId)
        ),
      })
    )

    const missingClaudiaInFlowBranches = validateFlowBranchesHaveClaudia(
      groups,
      safeEdges
    )
    missingClaudiaInFlowBranchesErrors = missingClaudiaInFlowBranches.map(
      (groupId) => ({
        type: 'missingClaudiaInFlowBranches',
        groupId,
        message: getErrorMessage(
          'missingClaudiaInFlowBranches',
          groupTitleMap.get(groupId)
        ),
      })
    )

    missingTextBetweenInputBlocksErrors = missingTextBetweenInputBlocks(
      variables,
      groups,
      safeEdges,
      groupTitleMap
    )
  }

  const errors = [
    ...invalidGroupsErrors,
    ...brokenLinksErrors,
    ...missingTextBeforeClaudiaErrors,
    ...missingClaudiaInFlowBranchesErrors,
    ...missingTextBetweenInputBlocksErrors,
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
      select: {
        variables: true,
        groups: true,
        edges: true,
        isSecondaryFlow: true,
      },
    })) as {
      variables: Variable[]
      groups: Group[]
      edges: Edge[]
      isSecondaryFlow: boolean
    } | null

    if (!typebot) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Typebot not found' })
    }

    const { isValid, errors } = await validateTypebot({
      ...typebot,
      isSecondaryFlow: typebot.isSecondaryFlow,
    })
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
      typebotId: z
        .string()
        .describe(
          'Typebot id to be validated (used only if typebot object not provided)'
        )
        .optional(),
      typebot: z
        .object({
          variables: z.array(variableSchema),
          edges: z.array(edgeSchema),
          groups: z.array(groupV6Schema.or(groupV5Schema)),
          isSecondaryFlow: z.boolean().optional().default(false),
        })
        .describe(
          'Typebot object to be validated directly (optional override)'
        ),
    })
  )
  .output(responseSchema)
  .mutation(async ({ input }) => {
    const { variables, groups, edges, isSecondaryFlow } = input.typebot
    return await validateTypebot({ variables, groups, edges, isSecondaryFlow })
  })
