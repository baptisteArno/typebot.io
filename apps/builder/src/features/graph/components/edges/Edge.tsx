import React, { useMemo, useState } from 'react'
import { Edge as EdgeProps } from '@typebot.io/schemas'
import { Portal, useColorMode, useDisclosure } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { colors } from '@/lib/theme'
import { useEndpoints } from '../../providers/EndpointsProvider'
import { computeEdgePath } from '../../helpers/computeEdgePath'
import { getAnchorsPosition } from '../../helpers/getAnchorsPosition'
import { useGraph } from '../../providers/GraphProvider'
import { EdgeMenu } from './EdgeMenu'
import { useEventsCoordinates } from '../../providers/EventsCoordinateProvider'
import { eventWidth, groupWidth } from '../../constants'
import { useGroupsStore } from '../../hooks/useGroupsStore'
import { useShallow } from 'zustand/react/shallow'

type Props = {
  edge: EdgeProps
  fromGroupId: string | undefined
}

export const Edge = ({ edge, fromGroupId }: Props) => {
  const isDark = useColorMode().colorMode === 'dark'
  const { deleteEdge } = useTypebot()
  const { previewingEdge, graphPosition, isReadOnly, setPreviewingEdge } =
    useGraph()
  const { sourceEndpointYOffsets, targetEndpointYOffsets } = useEndpoints()
  const fromGroupCoordinates = useGroupsStore(
    useShallow((state) =>
      fromGroupId && state.groupsCoordinates
        ? state.groupsCoordinates[fromGroupId]
        : undefined
    )
  )
  const toGroupCoordinates = useGroupsStore(
    useShallow((state) =>
      state.groupsCoordinates
        ? state.groupsCoordinates[edge.to.groupId]
        : undefined
    )
  )

  const { eventsCoordinates } = useEventsCoordinates()
  const [isMouseOver, setIsMouseOver] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [edgeMenuPosition, setEdgeMenuPosition] = useState({ x: 0, y: 0 })

  const isPreviewing = isMouseOver || previewingEdge?.id === edge.id

  const sourceElementCoordinates =
    'eventId' in edge.from
      ? eventsCoordinates[edge.from.eventId]
      : fromGroupCoordinates

  const sourceTop = useMemo(() => {
    const endpointId =
      'eventId' in edge.from
        ? edge.from.eventId
        : edge?.from.itemId ?? edge?.from.blockId
    if (!endpointId) return
    return sourceEndpointYOffsets.get(endpointId)?.y
  }, [edge.from, sourceEndpointYOffsets])

  const targetTop = useMemo(() => {
    if (targetEndpointYOffsets.size === 0) return
    if (edge.to.blockId) {
      const targetOffset = targetEndpointYOffsets.get(edge.to.blockId)
      if (!targetOffset) {
        // Something went wrong, the edge is connected to a block that doesn't exist anymore.
        deleteEdge(edge.id)
        return
      }
      return targetOffset.y
    }
    return
  }, [deleteEdge, edge.id, edge.to.blockId, targetEndpointYOffsets])

  const path = useMemo(() => {
    if (!sourceElementCoordinates || !toGroupCoordinates || !sourceTop)
      return ``
    const anchorsPosition = getAnchorsPosition({
      sourceGroupCoordinates: sourceElementCoordinates,
      targetGroupCoordinates: toGroupCoordinates,
      elementWidth: 'eventId' in edge.from ? eventWidth : groupWidth,
      sourceTop,
      targetTop,
      graphScale: graphPosition.scale,
    })
    return computeEdgePath(anchorsPosition)
  }, [
    sourceElementCoordinates,
    toGroupCoordinates,
    sourceTop,
    edge.from,
    targetTop,
    graphPosition.scale,
  ])

  const handleMouseEnter = () => setIsMouseOver(true)

  const handleMouseLeave = () => setIsMouseOver(false)

  const handleEdgeClick = () => {
    setPreviewingEdge(edge)
  }

  const handleContextMenuTrigger = (e: React.MouseEvent) => {
    if (isReadOnly) return
    e.preventDefault()
    setEdgeMenuPosition({ x: e.clientX, y: e.clientY })
    onOpen()
  }

  const handleDeleteEdge = () => deleteEdge(edge.id)

  return (
    <>
      <path
        data-testid="clickable-edge"
        d={path}
        strokeWidth="18px"
        stroke="white"
        fill="none"
        pointerEvents="stroke"
        style={{ cursor: 'pointer', visibility: 'hidden' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleEdgeClick}
        onContextMenu={handleContextMenuTrigger}
      />
      <path
        data-testid="edge"
        d={path}
        stroke={
          isPreviewing
            ? colors.blue[400]
            : isDark
            ? colors.gray[700]
            : colors.gray[400]
        }
        strokeWidth="2px"
        markerEnd={isPreviewing ? 'url(#blue-arrow)' : 'url(#arrow)'}
        fill="none"
        pointerEvents="none"
      />
      <Portal>
        <EdgeMenu
          isOpen={isOpen}
          position={edgeMenuPosition}
          onDeleteEdge={handleDeleteEdge}
          onClose={onClose}
        />
      </Portal>
    </>
  )
}
