import { Coordinates, useGraph, useGroupsCoordinates } from '../../providers'
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Edge as EdgeProps } from 'models'
import { Portal, useColorMode, useDisclosure } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor'
import { EdgeMenu } from './EdgeMenu'
import { colors } from '@/lib/theme'
import {
  getEndpointTopOffset,
  getSourceEndpointId,
  getAnchorsPosition,
  computeEdgePath,
} from '../../utils'

export type AnchorsPositionProps = {
  sourcePosition: Coordinates
  targetPosition: Coordinates
  sourceType: 'right' | 'left'
  totalSegments: number
}

type Props = {
  edge: EdgeProps
}
export const Edge = ({ edge }: Props) => {
  const isDark = useColorMode().colorMode === 'dark'
  const { deleteEdge } = useTypebot()
  const {
    previewingEdge,
    sourceEndpoints,
    targetEndpoints,
    graphPosition,
    isReadOnly,
    setPreviewingEdge,
  } = useGraph()
  const { groupsCoordinates } = useGroupsCoordinates()
  const [isMouseOver, setIsMouseOver] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [edgeMenuPosition, setEdgeMenuPosition] = useState({ x: 0, y: 0 })
  const [refreshEdge, setRefreshEdge] = useState(false)

  const isPreviewing = isMouseOver || previewingEdge?.id === edge.id

  const sourceGroupCoordinates =
    groupsCoordinates && groupsCoordinates[edge.from.groupId]
  const targetGroupCoordinates =
    groupsCoordinates && groupsCoordinates[edge.to.groupId]

  const sourceTop = useMemo(
    () =>
      getEndpointTopOffset({
        endpoints: sourceEndpoints,
        graphOffsetY: graphPosition.y,
        endpointId: getSourceEndpointId(edge),
        graphScale: graphPosition.scale,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sourceGroupCoordinates?.y, edge, sourceEndpoints, refreshEdge]
  )

  useEffect(() => {
    setTimeout(() => setRefreshEdge(true), 50)
  }, [])

  const [targetTop, setTargetTop] = useState(
    getEndpointTopOffset({
      endpoints: targetEndpoints,
      graphOffsetY: graphPosition.y,
      endpointId: edge?.to.blockId,
      graphScale: graphPosition.scale,
    })
  )
  useLayoutEffect(() => {
    setTargetTop(
      getEndpointTopOffset({
        endpoints: targetEndpoints,
        graphOffsetY: graphPosition.y,
        endpointId: edge?.to.blockId,
        graphScale: graphPosition.scale,
      })
    )
  }, [
    targetGroupCoordinates?.y,
    targetEndpoints,
    graphPosition.y,
    edge?.to.blockId,
    graphPosition.scale,
  ])

  const path = useMemo(() => {
    if (!sourceGroupCoordinates || !targetGroupCoordinates || !sourceTop)
      return ``
    const anchorsPosition = getAnchorsPosition({
      sourceGroupCoordinates,
      targetGroupCoordinates,
      sourceTop,
      targetTop,
      graphScale: graphPosition.scale,
    })
    return computeEdgePath(anchorsPosition)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sourceGroupCoordinates?.x,
    sourceGroupCoordinates?.y,
    targetGroupCoordinates?.x,
    targetGroupCoordinates?.y,
    sourceTop,
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
