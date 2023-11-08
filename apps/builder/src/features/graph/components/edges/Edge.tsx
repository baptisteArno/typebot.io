import React, { useMemo, useState } from 'react'
import { Edge as EdgeProps } from '@typebot.io/schemas'
import { Portal, useColorMode, useDisclosure } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { colors } from '@/lib/theme'
import { useEndpoints } from '../../providers/EndpointsProvider'
import { computeEdgePath } from '../../helpers/computeEdgePath'
import { getAnchorsPosition } from '../../helpers/getAnchorsPosition'
import { useGraph } from '../../providers/GraphProvider'
import { useGroupsCoordinates } from '../../providers/GroupsCoordinateProvider'
import { EdgeMenu } from './EdgeMenu'
import { useEventsCoordinates } from '../../providers/EventsCoordinateProvider'
import { eventWidth, groupWidth } from '../../constants'

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
  const { groupsCoordinates } = useGroupsCoordinates()
  const { eventsCoordinates } = useEventsCoordinates()
  const [isMouseOver, setIsMouseOver] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [edgeMenuPosition, setEdgeMenuPosition] = useState({ x: 0, y: 0 })

  const isPreviewing = isMouseOver || previewingEdge?.id === edge.id

  const sourceElementCoordinates =
    'eventId' in edge.from
      ? eventsCoordinates[edge.from.eventId]
      : groupsCoordinates[fromGroupId as string]
  const targetGroupCoordinates = groupsCoordinates[edge.to.groupId]

  const sourceTop = useMemo(() => {
    const endpointId =
      'eventId' in edge.from
        ? edge.from.eventId
        : edge?.from.itemId ?? edge?.from.blockId
    if (!endpointId) return
    return sourceEndpointYOffsets.get(endpointId)?.y
  }, [edge.from, sourceEndpointYOffsets])

  const targetTop = useMemo(
    () =>
      edge?.to.blockId
        ? targetEndpointYOffsets.get(edge?.to.blockId)?.y
        : undefined,
    [edge?.to.blockId, targetEndpointYOffsets]
  )

  const path = useMemo(() => {
    if (!sourceElementCoordinates || !targetGroupCoordinates || !sourceTop)
      return ``
    const anchorsPosition = getAnchorsPosition({
      sourceGroupCoordinates: sourceElementCoordinates,
      targetGroupCoordinates,
      elementWidth: 'eventId' in edge.from ? eventWidth : groupWidth,
      sourceTop,
      targetTop,
      graphScale: graphPosition.scale,
    })
    return computeEdgePath(anchorsPosition)
  }, [
    sourceElementCoordinates,
    targetGroupCoordinates,
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
