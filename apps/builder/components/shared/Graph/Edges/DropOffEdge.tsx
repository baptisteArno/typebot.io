import { VStack, Tag, Text, Tooltip } from '@chakra-ui/react'
import { useGraph, useGroupsCoordinates } from 'contexts/GraphContext'
import { useTypebot } from 'contexts/TypebotContext'
import { useWorkspace } from 'contexts/WorkspaceContext'
import React, { useMemo } from 'react'
import { AnswersCount } from 'services/analytics'
import {
  getEndpointTopOffset,
  computeSourceCoordinates,
  computeDropOffPath,
} from 'services/graph'
import { isWorkspaceProPlan } from 'services/workspace'
import { byId, isDefined } from 'utils'

type Props = {
  groupId: string
  answersCounts: AnswersCount[]
  onUnlockProPlanClick?: () => void
}

export const DropOffEdge = ({
  answersCounts,
  groupId,
  onUnlockProPlanClick,
}: Props) => {
  const { workspace } = useWorkspace()
  const { groupsCoordinates } = useGroupsCoordinates()
  const { sourceEndpoints, graphPosition } = useGraph()
  const { publishedTypebot } = useTypebot()

  const isProPlan = isWorkspaceProPlan(workspace)

  const totalAnswers = useMemo(
    () => answersCounts.find((a) => a.groupId === groupId)?.totalAnswers,
    [answersCounts, groupId]
  )

  const { totalDroppedUser, dropOffRate } = useMemo(() => {
    if (!publishedTypebot || totalAnswers === undefined)
      return { previousTotal: undefined, dropOffRate: undefined }
    const previousGroupIds = publishedTypebot.edges
      .map((edge) =>
        edge.to.groupId === groupId ? edge.from.groupId : undefined
      )
      .filter(isDefined)
    const previousTotal = answersCounts
      .filter((a) => previousGroupIds.includes(a.groupId))
      .reduce((prev, acc) => acc.totalAnswers + prev, 0)
    if (previousTotal === 0)
      return { previousTotal: undefined, dropOffRate: undefined }
    const totalDroppedUser = previousTotal - totalAnswers

    return {
      totalDroppedUser,
      dropOffRate: Math.round((totalDroppedUser / previousTotal) * 100),
    }
  }, [answersCounts, groupId, totalAnswers, publishedTypebot])

  const group = publishedTypebot?.groups.find(byId(groupId))
  const sourceTop = useMemo(
    () =>
      getEndpointTopOffset({
        endpoints: sourceEndpoints,
        graphOffsetY: graphPosition.y,
        endpointId: group?.blocks[group.blocks.length - 1].id,
        graphScale: graphPosition.scale,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [group?.blocks, sourceEndpoints, groupsCoordinates]
  )

  const labelCoordinates = useMemo(() => {
    if (!groupsCoordinates[groupId]) return
    return computeSourceCoordinates(groupsCoordinates[groupId], sourceTop ?? 0)
  }, [groupsCoordinates, groupId, sourceTop])

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
          isDisabled={isProPlan}
        >
          <VStack
            bgColor={'red.500'}
            color="white"
            rounded="md"
            p="2"
            justifyContent="center"
            w="full"
            h="full"
            onClick={isProPlan ? undefined : onUnlockProPlanClick}
            cursor={isProPlan ? 'auto' : 'pointer'}
          >
            <Text filter={isProPlan ? '' : 'blur(2px)'}>
              {isProPlan ? (
                dropOffRate
              ) : (
                <Text as="span" filter="blur(2px)">
                  X
                </Text>
              )}
              %
            </Text>
            <Tag colorScheme="red">
              {isProPlan ? (
                totalDroppedUser
              ) : (
                <Text as="span" filter="blur(3px)" mr="1">
                  NN
                </Text>
              )}{' '}
              users
            </Tag>
          </VStack>
        </Tooltip>
      </foreignObject>
    </>
  )
}
