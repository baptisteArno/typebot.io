import { useEventListener } from '@chakra-ui/hooks'
import { Coordinates } from '@dnd-kit/core/dist/types'
import { Block } from 'bot-engine'
import { headerHeight } from 'components/shared/TypebotHeader/TypebotHeader'
import {
  blockWidth,
  firstStepOffsetY,
  spaceBetweenSteps,
  stubLength,
  useGraph,
} from 'contexts/GraphContext'
import { useTypebot } from 'contexts/TypebotContext'
import React, { useMemo, useState } from 'react'
import {
  computeFlowChartConnectorPath,
  getAnchorsPosition,
} from 'services/graph'
import { roundCorners } from 'svg-round-corners'

export const DrawingEdge = () => {
  const { graphPosition, setConnectingIds, connectingIds } = useGraph()
  const { typebot, updateTarget } = useTypebot()
  const { startBlock, blocks } = typebot ?? {}
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const sourceBlock = useMemo(
    () =>
      [startBlock, ...(blocks ?? [])].find(
        (b) => b?.id === connectingIds?.blockId
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [connectingIds]
  )

  const path = useMemo(() => {
    if (!sourceBlock) return ``
    if (connectingIds?.target) {
      const targetedBlock = blocks?.find(
        (b) => b.id === connectingIds.target?.blockId
      ) as Block
      const targetedStepIndex = connectingIds.target.stepId
        ? targetedBlock.steps.findIndex(
            (s) => s.id === connectingIds.target?.stepId
          )
        : undefined
      const anchorsPosition = getAnchorsPosition(
        sourceBlock,
        targetedBlock,
        sourceBlock?.steps.findIndex((s) => s.id === connectingIds?.stepId),
        targetedStepIndex
      )
      return computeFlowChartConnectorPath(anchorsPosition)
    }
    return computeConnectingEdgePath(
      sourceBlock?.graphCoordinates,
      mousePosition,
      sourceBlock.steps.findIndex((s) => s.id === connectingIds?.stepId)
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceBlock, mousePosition])

  const handleMouseMove = (e: MouseEvent) => {
    setMousePosition({
      x: e.clientX - graphPosition.x,
      y: e.clientY - graphPosition.y - headerHeight,
    })
  }
  useEventListener('mousemove', handleMouseMove)
  useEventListener('mouseup', () => {
    if (connectingIds?.target) updateTarget(connectingIds)
    setConnectingIds(null)
  })

  if ((mousePosition.x === 0 && mousePosition.y === 0) || !connectingIds)
    return <></>
  return (
    <path
      d={path}
      stroke="#718096"
      strokeWidth="2px"
      markerEnd="url(#arrow)"
      fill="none"
    />
  )
}

const computeConnectingEdgePath = (
  blockPosition: Coordinates,
  mousePosition: Coordinates,
  stepIndex: number
): string => {
  const sourcePosition = {
    x:
      mousePosition.x - blockPosition.x > blockWidth / 2
        ? blockPosition.x + blockWidth - 40
        : blockPosition.x + 40,
    y: blockPosition.y + firstStepOffsetY + stepIndex * spaceBetweenSteps,
  }
  const sourceType =
    mousePosition.x - blockPosition.x > blockWidth / 2 ? 'right' : 'left'
  const segments = computeThreeSegments(
    sourcePosition,
    mousePosition,
    sourceType
  )
  return roundCorners(
    `M${sourcePosition.x},${sourcePosition.y} ${segments}`,
    10
  ).path
}

const computeThreeSegments = (
  sourcePosition: Coordinates,
  targetPosition: Coordinates,
  sourceType: 'right' | 'left'
) => {
  const segments = []
  const firstSegmentX =
    sourceType === 'right'
      ? sourcePosition.x + stubLength + 40
      : sourcePosition.x - stubLength - 40
  segments.push(`L${firstSegmentX},${sourcePosition.y}`)
  segments.push(`L${firstSegmentX},${targetPosition.y}`)
  segments.push(`L${targetPosition.x},${targetPosition.y}`)
  return segments.join(' ')
}
