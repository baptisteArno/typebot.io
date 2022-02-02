import { useEventListener } from '@chakra-ui/hooks'
import assert from 'assert'
import { headerHeight } from 'components/shared/TypebotHeader/TypebotHeader'
import { useGraph, ConnectingIds } from 'contexts/GraphContext'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import { Target } from 'models'
import React, { useMemo, useState } from 'react'
import {
  computeConnectingEdgePath,
  computeEdgePathToMouse,
  getEndpointTopOffset,
} from 'services/graph'

export const DrawingEdge = () => {
  const {
    graphPosition,
    setConnectingIds,
    connectingIds,
    sourceEndpoints,
    targetEndpoints,
    blocksCoordinates,
  } = useGraph()
  const { typebot, createEdge } = useTypebot()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const sourceBlock = useMemo(
    () => connectingIds && typebot?.blocks.byId[connectingIds.source.blockId],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [connectingIds]
  )

  const sourceTop = useMemo(() => {
    if (!sourceBlock || !connectingIds) return 0
    return getEndpointTopOffset(
      graphPosition,
      sourceEndpoints,
      connectingIds.source.buttonId ??
        connectingIds.source.stepId + (connectingIds.source.conditionType ?? '')
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphPosition, sourceEndpoints, connectingIds])

  const targetTop = useMemo(() => {
    if (!sourceBlock || !connectingIds) return 0
    return getEndpointTopOffset(
      graphPosition,
      targetEndpoints,
      connectingIds.target?.stepId
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphPosition, targetEndpoints, connectingIds])

  const path = useMemo(() => {
    if (
      !sourceBlock ||
      !typebot ||
      !connectingIds ||
      !blocksCoordinates ||
      !sourceTop
    )
      return ``

    return connectingIds?.target
      ? computeConnectingEdgePath({
          connectingIds: connectingIds as Omit<ConnectingIds, 'target'> & {
            target: Target
          },
          sourceTop,
          targetTop,
          blocksCoordinates,
        })
      : computeEdgePathToMouse({
          blockPosition: blocksCoordinates.byId[sourceBlock.id],
          mousePosition,
          sourceTop,
        })
  }, [
    sourceBlock,
    typebot,
    connectingIds,
    blocksCoordinates,
    sourceTop,
    targetTop,
    mousePosition,
  ])

  const handleMouseMove = (e: MouseEvent) => {
    setMousePosition({
      x: e.clientX - graphPosition.x,
      y: e.clientY - graphPosition.y - headerHeight,
    })
  }
  useEventListener('mousemove', handleMouseMove)
  useEventListener('mouseup', () => {
    if (connectingIds?.target) createNewEdge(connectingIds)
    setConnectingIds(null)
  })

  const createNewEdge = (connectingIds: ConnectingIds) => {
    assert(connectingIds.target)
    createEdge({ from: connectingIds.source, to: connectingIds.target })
  }

  if ((mousePosition.x === 0 && mousePosition.y === 0) || !connectingIds)
    return <></>
  return (
    <path
      d={path}
      stroke="#1a5fff"
      strokeWidth="2px"
      markerEnd="url(#blue-arrow)"
      fill="none"
    />
  )
}
