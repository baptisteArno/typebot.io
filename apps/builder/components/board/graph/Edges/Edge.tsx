import { Coordinates, useGraph } from 'contexts/GraphContext'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import React, { useEffect, useMemo, useState } from 'react'
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
  const { previewingEdgeId, sourceEndpoints, targetEndpoints, graphPosition } =
    useGraph()
  const edge = useMemo(
    () => typebot?.edges.byId[edgeId],
    [edgeId, typebot?.edges.byId]
  )
  const isPreviewing = previewingEdgeId === edgeId
  const [sourceTop, setSourceTop] = useState(
    getEndpointTopOffset(
      graphPosition,
      sourceEndpoints,
      getSourceEndpointId(edge)
    )
  )
  const [targetTop, setTargetTop] = useState(
    getEndpointTopOffset(graphPosition, targetEndpoints, edge?.to.stepId)
  )

  useEffect(() => {
    const newSourceTop = getEndpointTopOffset(
      graphPosition,
      sourceEndpoints,
      getSourceEndpointId(edge)
    )
    const sensibilityThreshold = 10
    const newSourceTopIsTooClose =
      sourceTop < newSourceTop + sensibilityThreshold &&
      sourceTop > newSourceTop - sensibilityThreshold
    if (newSourceTopIsTooClose) return
    setSourceTop(newSourceTop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typebot?.blocks, typebot?.steps, graphPosition, sourceEndpoints])

  useEffect(() => {
    if (!edge) return
    const newTargetTop = getEndpointTopOffset(
      graphPosition,
      targetEndpoints,
      edge?.to.stepId
    )
    const sensibilityThreshold = 10
    const newSourceTopIsTooClose =
      targetTop < newTargetTop + sensibilityThreshold &&
      targetTop > newTargetTop - sensibilityThreshold
    if (newSourceTopIsTooClose) return
    setTargetTop(newTargetTop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typebot?.blocks, typebot?.steps, graphPosition, targetEndpoints])

  const { sourceBlock, targetBlock } = useMemo(() => {
    if (!typebot || !edge?.from.stepId) return {}
    const sourceBlock = typebot.blocks.byId[edge.from.blockId]
    const targetBlock = typebot.blocks.byId[edge.to.blockId]
    return {
      sourceBlock,
      targetBlock,
    }
  }, [edge?.from.blockId, edge?.from.stepId, edge?.to.blockId, typebot])

  const path = useMemo(() => {
    if (!sourceBlock || !targetBlock) return ``
    const anchorsPosition = getAnchorsPosition({
      sourceBlock,
      targetBlock,
      sourceTop,
      targetTop,
    })
    return computeEdgePath(anchorsPosition)
  }, [sourceBlock, sourceTop, targetBlock, targetTop])

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
