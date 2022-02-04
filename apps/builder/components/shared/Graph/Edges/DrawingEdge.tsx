import { useEventListener } from '@chakra-ui/hooks'
import assert from 'assert'
import { headerHeight } from 'components/shared/TypebotHeader/TypebotHeader'
import { useGraph, ConnectingIds } from 'contexts/GraphContext'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
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
  const { createEdge } = useTypebot()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const sourceBlockCoordinates =
    blocksCoordinates && blocksCoordinates[connectingIds?.source.blockId ?? '']
  const targetBlockCoordinates =
    blocksCoordinates && blocksCoordinates[connectingIds?.target?.blockId ?? '']

  const sourceTop = useMemo(() => {
    if (!connectingIds) return 0
    return getEndpointTopOffset(
      graphPosition,
      sourceEndpoints,
      connectingIds.source.itemId ?? connectingIds.source.stepId
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphPosition, sourceEndpoints, connectingIds])

  const targetTop = useMemo(() => {
    if (!connectingIds) return 0
    return getEndpointTopOffset(
      graphPosition,
      targetEndpoints,
      connectingIds.target?.stepId
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphPosition, targetEndpoints, connectingIds])

  const path = useMemo(() => {
    if (!sourceTop || !sourceBlockCoordinates) return ``

    return targetBlockCoordinates
      ? computeConnectingEdgePath({
          sourceBlockCoordinates,
          targetBlockCoordinates,
          sourceTop,
          targetTop,
        })
      : computeEdgePathToMouse({
          sourceBlockCoordinates,
          mousePosition,
          sourceTop,
        })
  }, [
    sourceTop,
    sourceBlockCoordinates,
    targetBlockCoordinates,
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
