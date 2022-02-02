import { Coordinates, useGraph } from 'contexts/GraphContext'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import React, { useMemo } from 'react'
import {
  getAnchorsPosition,
  computeEdgePath,
  getEndpointTopOffset,
  getSourceEndpointId,
} from 'services/graph'

export type AnchorsPositionProps = {
  sourcePosition: Coordinates
  targetPosition: Coordinates
  sourceType: 'right' | 'left'
  totalSegments: number
}

export const Edge = ({ edgeId }: { edgeId: string }) => {
  const { typebot } = useTypebot()
  const {
    previewingEdgeId,
    sourceEndpoints,
    targetEndpoints,
    graphPosition,
    blocksCoordinates,
  } = useGraph()
  const edge = useMemo(
    () => typebot?.edges.byId[edgeId],
    [edgeId, typebot?.edges.byId]
  )
  const isPreviewing = previewingEdgeId === edgeId

  const sourceBlock = edge && typebot?.blocks.byId[edge.from.blockId]
  const targetBlock = edge && typebot?.blocks.byId[edge.to.blockId]

  const sourceBlockCoordinates =
    sourceBlock && blocksCoordinates?.byId[sourceBlock.id]
  const targetBlockCoordinates =
    targetBlock && blocksCoordinates?.byId[targetBlock.id]

  const sourceTop = useMemo(
    () =>
      getEndpointTopOffset(
        graphPosition,
        sourceEndpoints,
        getSourceEndpointId(edge)
      ),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [edge, graphPosition, sourceEndpoints, sourceBlockCoordinates?.y]
  )
  const targetTop = useMemo(
    () => getEndpointTopOffset(graphPosition, targetEndpoints, edge?.to.stepId),
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
      d={path}
      stroke={isPreviewing ? '#1a5fff' : '#718096'}
      strokeWidth="2px"
      markerEnd={isPreviewing ? 'url(#blue-arrow)' : 'url(#arrow)'}
      fill="none"
    />
  )
}
