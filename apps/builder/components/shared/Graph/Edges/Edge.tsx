import { Coordinates, useGraph } from 'contexts/GraphContext'
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import {
  getAnchorsPosition,
  computeEdgePath,
  getEndpointTopOffset,
  getSourceEndpointId,
} from 'services/graph'
import { Block, Edge as EdgeProps } from 'models'
import { Portal, useDisclosure } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'
import { EdgeMenu } from './EdgeMenu'
import { colors } from 'libs/theme'

export type AnchorsPositionProps = {
  sourcePosition: Coordinates
  targetPosition: Coordinates
  sourceType: 'right' | 'left'
  totalSegments: number
}

export const Edge = ({ edge, block }: { edge: EdgeProps; block: Block }) => {
  const { deleteEdge } = useTypebot()
  const {
    previewingEdge,
    sourceEndpoints,
    targetEndpoints,
    blocksCoordinates,
    graphPosition,
    isReadOnly,
    setPreviewingEdge,
  } = useGraph()
  const [isMouseOver, setIsMouseOver] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [edgeMenuPosition, setEdgeMenuPosition] = useState({ x: 0, y: 0 })
  const [refreshEdge, setRefreshEdge] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const isPreviewing = isMouseOver || previewingEdge?.id === edge.id

  const sourceBlockCoordinates =
    blocksCoordinates && blocksCoordinates[edge.from.blockId]
  const targetBlockCoordinates =
    blocksCoordinates && blocksCoordinates[edge.to.blockId]

  const sourceTop = useMemo(
    () => {
      return getEndpointTopOffset({
        endpoints: sourceEndpoints,
        graphOffsetY: graphPosition.y,
        endpointId: getSourceEndpointId(edge),
        graphScale: graphPosition.scale,
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshEdge]
  )

  useEffect(() => {
    if (isRefreshing) return
    setIsRefreshing(true)
    const timer = setTimeout(() => {
      setRefreshEdge((v) => !v)
      setIsRefreshing(false)

      return () => clearTimeout(timer)
    }, 200)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sourceBlockCoordinates?.y,
    edge,
    sourceEndpoints.block,
    block,
    graphPosition.y,
  ])

  const [targetTop, setTargetTop] = useState(
    getEndpointTopOffset({
      endpoints: targetEndpoints,
      graphOffsetY: graphPosition.y,
      endpointId: edge?.to.stepId,
      graphScale: graphPosition.scale,
    })
  )
  useLayoutEffect(() => {
    setTargetTop(
      getEndpointTopOffset({
        endpoints: targetEndpoints,
        graphOffsetY: graphPosition.y,
        endpointId: edge?.to.stepId,
        graphScale: graphPosition.scale,
      })
    )
  }, [
    targetBlockCoordinates?.y,
    targetEndpoints,
    graphPosition.y,
    edge?.to.stepId,
    graphPosition.scale,
  ])

  const path = useMemo(() => {
    if (!sourceBlockCoordinates || !targetBlockCoordinates || !sourceTop)
      return ``
    const anchorsPosition = getAnchorsPosition({
      sourceBlockCoordinates,
      targetBlockCoordinates,
      sourceTop,
      targetTop,
      graphScale: graphPosition.scale,
    })
    return computeEdgePath(anchorsPosition)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sourceBlockCoordinates?.x,
    sourceBlockCoordinates?.y,
    targetBlockCoordinates?.x,
    targetBlockCoordinates?.y,
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
        strokeWidth="12px"
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
        stroke={isPreviewing ? colors.blue[400] : colors.gray[400]}
        strokeWidth="2px"
        markerEnd={isPreviewing ? 'url(#blue-arrow)' : 'url(#arrow)'}
        fill="none"
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
