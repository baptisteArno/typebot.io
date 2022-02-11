import { Coordinates, useGraph } from 'contexts/GraphContext'
import React, { useMemo } from 'react'
import {
  getAnchorsPosition,
  computeEdgePath,
  getEndpointTopOffset,
  getSourceEndpointId,
} from 'services/graph'
import { Edge as EdgeProps } from 'models'

export type AnchorsPositionProps = {
  sourcePosition: Coordinates
  targetPosition: Coordinates
  sourceType: 'right' | 'left'
  totalSegments: number
}

export const Edge = ({ edge }: { edge: EdgeProps }) => {
  const {
    previewingEdge,
    sourceEndpoints,
    targetEndpoints,
    graphPosition,
    blocksCoordinates,
    isReadOnly,
  } = useGraph()
  const isPreviewing = previewingEdge?.id === edge.id

  const sourceBlockCoordinates =
    blocksCoordinates && blocksCoordinates[edge.from.blockId]
  const targetBlockCoordinates =
    blocksCoordinates && blocksCoordinates[edge.to.blockId]

  const sourceTop = useMemo(
    () =>
      getEndpointTopOffset(
        graphPosition,
        sourceEndpoints,
        getSourceEndpointId(edge),
        isReadOnly
      ),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [edge, graphPosition, sourceEndpoints, sourceBlockCoordinates?.y]
  )
  const targetTop = useMemo(
    () =>
      getEndpointTopOffset(
        graphPosition,
        targetEndpoints,
        edge?.to.stepId,
        isReadOnly
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [graphPosition, targetEndpoints, edge?.to.stepId, targetBlockCoordinates?.y]
  )

  const path = useMemo(() => {
    if (!sourceBlockCoordinates || !targetBlockCoordinates || !sourceTop)
      return ``
    const anchorsPosition = getAnchorsPosition({
      sourceBlockCoordinates,
      targetBlockCoordinates,
      sourceTop,
      targetTop,
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

  if (sourceTop === 0) return <></>
  return (
    <path
      data-testid="edge"
      d={path}
      stroke={isPreviewing ? '#1a5fff' : '#718096'}
      strokeWidth="2px"
      markerEnd={isPreviewing ? 'url(#blue-arrow)' : 'url(#arrow)'}
      fill="none"
    />
  )
}
