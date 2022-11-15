import { useEventListener } from '@chakra-ui/react'
import assert from 'assert'
import {
  useGraph,
  ConnectingIds,
  Coordinates,
  useGroupsCoordinates,
} from '../../providers'
import { useTypebot } from '@/features/editor'
import { colors } from '@/lib/theme'
import React, { useMemo, useState } from 'react'
import {
  computeConnectingEdgePath,
  computeEdgePathToMouse,
  getEndpointTopOffset,
} from '../../utils'

export const DrawingEdge = () => {
  const {
    graphPosition,
    setConnectingIds,
    connectingIds,
    sourceEndpoints,
    targetEndpoints,
  } = useGraph()
  const { groupsCoordinates } = useGroupsCoordinates()
  const { createEdge } = useTypebot()
  const [mousePosition, setMousePosition] = useState<Coordinates | null>(null)

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
    if (!sourceTop || !sourceGroupCoordinates || !mousePosition) return ``

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
    if (!connectingIds) {
      if (mousePosition) setMousePosition(null)
      return
    }
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

  if (
    (mousePosition && mousePosition.x === 0 && mousePosition.y === 0) ||
    !connectingIds
  )
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
