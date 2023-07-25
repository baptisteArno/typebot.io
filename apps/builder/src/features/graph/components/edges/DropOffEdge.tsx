import {
  VStack,
  Tag,
  Text,
  Tooltip,
  useColorModeValue,
  theme,
} from '@chakra-ui/react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import React, { useMemo } from 'react'
import { useEndpoints } from '../../providers/EndpointsProvider'
import { useGroupsCoordinates } from '../../providers/GroupsCoordinateProvider'
import { isProPlan } from '@/features/billing/helpers/isProPlan'
import { computeDropOffPath } from '../../helpers/computeDropOffPath'
import { computeSourceCoordinates } from '../../helpers/computeSourceCoordinates'
import { TotalAnswersInBlock } from '@typebot.io/schemas/features/analytics'
import { computePreviousTotalAnswers } from '@/features/analytics/helpers/computePreviousTotalAnswers'
import { blockHasItems } from '@typebot.io/lib'

export const dropOffBoxDimensions = {
  width: 100,
  height: 55,
}

export const dropOffSegmentLength = 80
const dropOffSegmentMinWidth = 2
const dropOffSegmentMaxWidth = 20

export const dropOffStubLength = 30

type Props = {
  totalAnswersInBlocks: TotalAnswersInBlock[]
  blockId: string
  onUnlockProPlanClick?: () => void
}

export const DropOffEdge = ({
  totalAnswersInBlocks,
  blockId,
  onUnlockProPlanClick,
}: Props) => {
  const dropOffColor = useColorModeValue(
    theme.colors.red[500],
    theme.colors.red[400]
  )
  const { workspace } = useWorkspace()
  const { groupsCoordinates } = useGroupsCoordinates()
  const { sourceEndpointYOffsets: sourceEndpoints } = useEndpoints()
  const { publishedTypebot } = useTypebot()
  const currentBlock = useMemo(
    () =>
      totalAnswersInBlocks.reduce<TotalAnswersInBlock | undefined>(
        (block, totalAnswersInBlock) => {
          if (totalAnswersInBlock.blockId === blockId) {
            return block
              ? { ...block, total: block.total + totalAnswersInBlock.total }
              : totalAnswersInBlock
          }
          return block
        },
        undefined
      ),
    [blockId, totalAnswersInBlocks]
  )

  const isWorkspaceProPlan = isProPlan(workspace)

  const { totalDroppedUser, dropOffRate } = useMemo(() => {
    if (!publishedTypebot || currentBlock?.total === undefined)
      return { previousTotal: undefined, dropOffRate: undefined }
    const totalAnswers = currentBlock.total
    const previousTotal = computePreviousTotalAnswers(
      publishedTypebot,
      currentBlock.blockId,
      totalAnswersInBlocks
    )
    if (previousTotal === 0)
      return { previousTotal: undefined, dropOffRate: undefined }
    const totalDroppedUser = previousTotal - totalAnswers

    return {
      totalDroppedUser,
      dropOffRate: Math.round((totalDroppedUser / previousTotal) * 100),
    }
  }, [
    currentBlock?.blockId,
    currentBlock?.total,
    publishedTypebot,
    totalAnswersInBlocks,
  ])

  const sourceTop = useMemo(() => {
    const blockTop = currentBlock?.blockId
      ? sourceEndpoints.get(currentBlock.blockId)?.y
      : undefined
    if (blockTop) return blockTop
    const block = publishedTypebot?.groups
      .flatMap((group) => group.blocks)
      .find((block) => block.id === currentBlock?.blockId)
    if (!block || !blockHasItems(block)) return 0
    const itemId = block.items.at(-1)?.id
    if (!itemId) return 0
    return sourceEndpoints.get(itemId)?.y
  }, [currentBlock?.blockId, publishedTypebot?.groups, sourceEndpoints])

  const endpointCoordinates = useMemo(() => {
    const groupId = publishedTypebot?.groups.find((group) =>
      group.blocks.some((block) => block.id === currentBlock?.blockId)
    )?.id
    if (!groupId) return undefined
    const coordinates = groupsCoordinates[groupId]
    if (!coordinates) return undefined
    return computeSourceCoordinates(coordinates, sourceTop ?? 0)
  }, [
    publishedTypebot?.groups,
    groupsCoordinates,
    sourceTop,
    currentBlock?.blockId,
  ])

  const isLastBlock = useMemo(() => {
    if (!publishedTypebot) return false
    const lastBlock = publishedTypebot.groups
      .find((group) =>
        group.blocks.some((block) => block.id === currentBlock?.blockId)
      )
      ?.blocks.at(-1)
    return lastBlock?.id === currentBlock?.blockId
  }, [publishedTypebot, currentBlock?.blockId])

  if (!endpointCoordinates) return null

  return (
    <>
      <path
        d={computeDropOffPath(
          {
            x: endpointCoordinates.x,
            y: endpointCoordinates.y,
          },
          isLastBlock
        )}
        stroke={dropOffColor}
        strokeWidth={
          dropOffSegmentMinWidth * (1 - (dropOffRate ?? 0) / 100) +
          dropOffSegmentMaxWidth * ((dropOffRate ?? 0) / 100)
        }
        fill="none"
      />
      <foreignObject
        width={dropOffBoxDimensions.width}
        height={dropOffBoxDimensions.height}
        x={endpointCoordinates.x + dropOffStubLength}
        y={
          endpointCoordinates.y +
          (isLastBlock
            ? dropOffSegmentLength
            : -(dropOffBoxDimensions.height / 2))
        }
      >
        <Tooltip
          label={
            isWorkspaceProPlan
              ? `At this input, ${totalDroppedUser} user${
                  (totalDroppedUser ?? 2) > 1 ? 's' : ''
                } left. This represents ${dropOffRate}% of the users who saw this input.`
              : 'Upgrade your plan to PRO to reveal drop-off rate.'
          }
          placement="top"
        >
          <VStack
            bgColor={dropOffColor}
            color="white"
            rounded="md"
            p="2"
            justifyContent="center"
            w="full"
            h="full"
            onClick={isWorkspaceProPlan ? undefined : onUnlockProPlanClick}
            cursor={isWorkspaceProPlan ? 'auto' : 'pointer'}
            spacing={0.5}
          >
            <Text filter={isWorkspaceProPlan ? '' : 'blur(2px)'} fontSize="sm">
              {isWorkspaceProPlan ? (
                dropOffRate
              ) : (
                <Text as="span" filter="blur(2px)">
                  X
                </Text>
              )}
              %
            </Text>
            <Tag colorScheme="red" size="sm">
              {isWorkspaceProPlan ? (
                totalDroppedUser
              ) : (
                <Text as="span" filter="blur(3px)" mr="1">
                  NN
                </Text>
              )}{' '}
              user{(totalDroppedUser ?? 2) > 1 ? 's' : ''}
            </Tag>
          </VStack>
        </Tooltip>
      </foreignObject>
    </>
  )
}
