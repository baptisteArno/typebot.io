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
    blocksCoordinates,
    graphOffsetY,
  } = useGraph()
  const isPreviewing = previewingEdge?.id === edge.id

  const sourceBlockCoordinates =
    blocksCoordinates && blocksCoordinates[edge.from.blockId]
  const targetBlockCoordinates =
    blocksCoordinates && blocksCoordinates[edge.to.blockId]

  const sourceTop = useMemo(
    () =>
      getEndpointTopOffset(
        sourceEndpoints,
        graphOffsetY,
        getSourceEndpointId(edge)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      sourceBlockCoordinates?.x,
      sourceBlockCoordinates?.y,
      edge,
      sourceEndpoints,
    ]
  )
  const targetTop = useMemo(
    () => getEndpointTopOffset(targetEndpoints, graphOffsetY, edge?.to.stepId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      targetBlockCoordinates?.x,
      targetBlockCoordinates?.y,
      edge?.to.stepId,
      targetEndpoints,
    ]
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
