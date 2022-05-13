import { VStack, Tag, Text, Tooltip } from '@chakra-ui/react'
import { useGraph } from 'contexts/GraphContext'
import { useTypebot } from 'contexts/TypebotContext'
import { useWorkspace } from 'contexts/WorkspaceContext'
import React, { useMemo } from 'react'
import { AnswersCount } from 'services/analytics'
import {
  getEndpointTopOffset,
  computeSourceCoordinates,
  computeDropOffPath,
} from 'services/graph'
import { isFreePlan } from 'services/workspace'
import { byId, isDefined } from 'utils'

type Props = {
  blockId: string
  answersCounts: AnswersCount[]
  onUnlockProPlanClick?: () => void
}

export const DropOffEdge = ({
  answersCounts,
  blockId,
  onUnlockProPlanClick,
}: Props) => {
  const { workspace } = useWorkspace()
  const { sourceEndpoints, blocksCoordinates, graphPosition } = useGraph()
  const { publishedTypebot } = useTypebot()

  const isUserOnFreePlan = isFreePlan(workspace)

  const totalAnswers = useMemo(
    () => answersCounts.find((a) => a.blockId === blockId)?.totalAnswers,
    [answersCounts, blockId]
  )

  const { totalDroppedUser, dropOffRate } = useMemo(() => {
    if (!publishedTypebot || totalAnswers === undefined)
      return { previousTotal: undefined, dropOffRate: undefined }
    const previousBlockIds = publishedTypebot.edges
      .map((edge) =>
        edge.to.blockId === blockId ? edge.from.blockId : undefined
      )
      .filter(isDefined)
    const previousTotal = answersCounts
      .filter((a) => previousBlockIds.includes(a.blockId))
      .reduce((prev, acc) => acc.totalAnswers + prev, 0)
    if (previousTotal === 0)
      return { previousTotal: undefined, dropOffRate: undefined }
    const totalDroppedUser = previousTotal - totalAnswers

    return {
      totalDroppedUser,
      dropOffRate: Math.round((totalDroppedUser / previousTotal) * 100),
    }
  }, [answersCounts, blockId, totalAnswers, publishedTypebot])

  const block = publishedTypebot?.blocks.find(byId(blockId))
  const sourceTop = useMemo(
    () =>
      getEndpointTopOffset({
        endpoints: sourceEndpoints,
        graphOffsetY: graphPosition.y,
        endpointId: block?.steps[block.steps.length - 1].id,
        graphScale: graphPosition.scale,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [block?.steps, sourceEndpoints, blocksCoordinates]
  )

  const labelCoordinates = useMemo(() => {
    if (!blocksCoordinates[blockId]) return
    return computeSourceCoordinates(blocksCoordinates[blockId], sourceTop ?? 0)
  }, [blocksCoordinates, blockId, sourceTop])

  if (!labelCoordinates) return <></>
  return (
    <>
      <path
        d={computeDropOffPath(
          { x: labelCoordinates.x - 300, y: labelCoordinates.y },
          sourceTop ?? 0
        )}
        stroke="#e53e3e"
        strokeWidth="2px"
        markerEnd="url(#red-arrow)"
        fill="none"
      />
      <foreignObject
        width="100"
        height="80"
        x={labelCoordinates.x - 30}
        y={labelCoordinates.y + 80}
      >
        <Tooltip
          label="Unlock Drop-off rate by upgrading to Pro plan"
          isDisabled={!isUserOnFreePlan}
        >
          <VStack
            bgColor={'red.500'}
            color="white"
            rounded="md"
            p="2"
            justifyContent="center"
            w="full"
            h="full"
            filter={isUserOnFreePlan ? 'blur(4px)' : ''}
            onClick={isUserOnFreePlan ? onUnlockProPlanClick : undefined}
            cursor={isUserOnFreePlan ? 'pointer' : 'auto'}
          >
            <Text>{isUserOnFreePlan ? 'X' : dropOffRate}%</Text>
            <Tag colorScheme="red">
              {isUserOnFreePlan ? 'n' : totalDroppedUser} users
            </Tag>
          </VStack>
        </Tooltip>
      </foreignObject>
    </>
  )
}
