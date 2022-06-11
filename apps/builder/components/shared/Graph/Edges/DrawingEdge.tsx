import { useEventListener } from '@chakra-ui/hooks'
import assert from 'assert'
import { useGraph, ConnectingIds } from 'contexts/GraphContext'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import { colors } from 'libs/theme'
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
    groupsCoordinates,
  } = useGraph()
  const { createEdge } = useTypebot()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const sourceGroupCoordinates =
    groupsCoordinates && groupsCoordinates[connectingIds?.source.groupId ?? '']
  const targetGroupCoordinates =
    groupsCoordinates && groupsCoordinates[connectingIds?.target?.groupId ?? '']

  const sourceTop = useMemo(() => {
    if (!connectingIds) return 0
    return getEndpointTopOffset({
      endpoints: sourceEndpoints,
      graphOffsetY: graphPosition.y,
      endpointId: connectingIds.source.itemId ?? connectingIds.source.blockId,
      graphScale: graphPosition.scale,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectingIds, sourceEndpoints])

  const targetTop = useMemo(() => {
    if (!connectingIds) return 0
    return getEndpointTopOffset({
      endpoints: targetEndpoints,
      graphOffsetY: graphPosition.y,
      endpointId: connectingIds.target?.blockId,
      graphScale: graphPosition.scale,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectingIds, targetEndpoints])

  const path = useMemo(() => {
    if (!sourceTop || !sourceGroupCoordinates) return ``

    return targetGroupCoordinates
      ? computeConnectingEdgePath({
          sourceGroupCoordinates,
          targetGroupCoordinates,
          sourceTop,
          targetTop,
          graphScale: graphPosition.scale,
        })
      : computeEdgePathToMouse({
          sourceGroupCoordinates,
          mousePosition,
          sourceTop,
        })
  }, [
    sourceTop,
    sourceGroupCoordinates,
    targetGroupCoordinates,
    targetTop,
    mousePosition,
    graphPosition.scale,
  ])

  const handleMouseMove = (e: MouseEvent) => {
    const coordinates = {
      x: (e.clientX - graphPosition.x) / graphPosition.scale,
      y: (e.clientY - graphPosition.y) / graphPosition.scale,
    }
    setMousePosition(coordinates)
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
      stroke={colors.blue[400]}
      strokeWidth="2px"
      markerEnd="url(#blue-arrow)"
      fill="none"
    />
  )
}
