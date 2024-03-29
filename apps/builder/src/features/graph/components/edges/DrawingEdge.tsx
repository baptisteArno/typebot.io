import { useEventListener } from '@chakra-ui/react'
import assert from 'assert'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { colors } from '@/lib/theme'
import React, { useMemo, useState } from 'react'
import { useEndpoints } from '../../providers/EndpointsProvider'
import { Coordinates } from '@dnd-kit/utilities'
import { computeConnectingEdgePath } from '../../helpers/computeConnectingEdgePath'
import { computeEdgePathToMouse } from '../../helpers/computeEdgePathToMouth'
import { useGraph } from '../../providers/GraphProvider'
import { ConnectingIds } from '../../types'
import { useEventsCoordinates } from '../../providers/EventsCoordinateProvider'
import { eventWidth, groupWidth } from '../../constants'
import { useGroupsStore } from '../../hooks/useGroupsStore'
import { omit } from '@typebot.io/lib'

type Props = {
  connectingIds: ConnectingIds
}

export const DrawingEdge = ({ connectingIds }: Props) => {
  const { graphPosition, setConnectingIds } = useGraph()
  const {
    sourceEndpointYOffsets: sourceEndpoints,
    targetEndpointYOffsets: targetEndpoints,
  } = useEndpoints()
  const groupsCoordinates = useGroupsStore(
    (state) => state.groupsCoordinates,
    // Keep in cache because groups are not changing while drawing an edge
    () => true
  )
  const { eventsCoordinates } = useEventsCoordinates()
  const { createEdge } = useTypebot()
  const [mousePosition, setMousePosition] = useState<Coordinates | null>(null)

  const sourceElementCoordinates = connectingIds
    ? 'eventId' in connectingIds.source
      ? eventsCoordinates[connectingIds?.source.eventId]
      : groupsCoordinates
      ? groupsCoordinates[connectingIds?.source.groupId ?? '']
      : undefined
    : undefined

  const targetGroupCoordinates =
    groupsCoordinates && groupsCoordinates[connectingIds?.target?.groupId ?? '']

  const sourceTop = useMemo(() => {
    if (!connectingIds) return 0
    const endpointId =
      'eventId' in connectingIds.source
        ? connectingIds.source.eventId
        : connectingIds.source.itemId ?? connectingIds.source.blockId
    return sourceEndpoints.get(endpointId)?.y
  }, [connectingIds, sourceEndpoints])

  const targetTop = useMemo(() => {
    if (!connectingIds) return 0
    const endpointId = connectingIds.target?.blockId
    return endpointId ? targetEndpoints.get(endpointId)?.y : undefined
  }, [connectingIds, targetEndpoints])

  const path = useMemo(() => {
    if (
      !sourceTop ||
      !sourceElementCoordinates ||
      !mousePosition ||
      !connectingIds?.source
    )
      return ``

    return targetGroupCoordinates
      ? computeConnectingEdgePath({
          sourceGroupCoordinates: sourceElementCoordinates,
          targetGroupCoordinates,
          elementWidth:
            'eventId' in connectingIds.source ? eventWidth : groupWidth,
          sourceTop,
          targetTop,
          graphScale: graphPosition.scale,
        })
      : computeEdgePathToMouse({
          sourceGroupCoordinates: sourceElementCoordinates,
          mousePosition,
          sourceTop,
          elementWidth:
            'eventId' in connectingIds.source ? eventWidth : groupWidth,
        })
  }, [
    sourceTop,
    sourceElementCoordinates,
    mousePosition,
    targetGroupCoordinates,
    connectingIds?.source,
    targetTop,
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
    createEdge({
      from:
        'groupId' in connectingIds.source
          ? omit(connectingIds.source, 'groupId')
          : connectingIds.source,
      to: connectingIds.target,
    })
  }

  if (mousePosition && mousePosition.x === 0 && mousePosition.y === 0)
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
